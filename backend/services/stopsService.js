import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GTFS_DIR = path.join(__dirname, "../data/gtfsdata");

// Cache: routeId -> [{stopId, stopName, lat, lon}]
const routeToStopsCache = new Map();
let cachePopulated = false;

// Compute bearing (degrees 0-360) between two lat/lon points
const computeBearing = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const buildCache = () => {
  if (cachePopulated) return;

  console.log("[StopsService] Building stops cache...");
  const start = Date.now();

  // 1. Parse stops.txt -> stopsMap
  const stopsMap = new Map();
  const stopsData = fs.readFileSync(path.join(GTFS_DIR, "stops.txt"), "utf8");
  stopsData
    .split("\n")
    .slice(1)
    .filter((line) => line.trim())
    .forEach((line) => {
      const cols = line.split(",");
      const stopId = cols[0];
      const stopName = cols[2];
      const lat = parseFloat(cols[4]);
      const lon = parseFloat(cols[5]);
      if (stopId && !isNaN(lat) && !isNaN(lon)) {
        stopsMap.set(stopId, { stopName, lat, lon });
      }
    });

  // 2. Parse trips.txt -> routeToTrips: Map<routeId, Set<tripId>>, tripToHeadsign: Map<tripId, string>
  const routeToTrips = new Map();
  const tripToHeadsign = new Map();
  const tripsData = fs.readFileSync(path.join(GTFS_DIR, "trips.txt"), "utf8");
  tripsData
    .split("\n")
    .slice(1)
    .filter((line) => line.trim())
    .forEach((line) => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const routeId = cols[0];
      const tripId = cols[2];
      const headsign = cols[3]?.replace(/^"|"$/g, "").trim();
      if (!routeToTrips.has(routeId)) routeToTrips.set(routeId, new Set());
      routeToTrips.get(routeId).add(tripId);
      if (tripId && headsign) tripToHeadsign.set(tripId, headsign);
    });

  // 3. Parse stop_times.txt -> tripToStops (Set) + tripToStopSeq (ordered array)
  const tripToStops = new Map();
  const tripToStopSeq = new Map(); // tripId -> [{stopId, seq}] (built then sorted)
  const stopTimesData = fs.readFileSync(
    path.join(GTFS_DIR, "stop_times.txt"),
    "utf8"
  );
  stopTimesData
    .split("\n")
    .slice(1)
    .filter((line) => line.trim())
    .forEach((line) => {
      const commaIdx = line.indexOf(",");
      const tripId = line.substring(0, commaIdx);
      // stop_id is 4th column (index 3)
      const rest = line.substring(commaIdx + 1);
      const cols = rest.split(",");
      const stopId = cols[2]; // arrival, departure, stop_id
      const seq = parseInt(cols[3], 10); // stop_sequence
      if (tripId && stopId) {
        if (!tripToStops.has(tripId)) tripToStops.set(tripId, new Set());
        tripToStops.get(tripId).add(stopId);
        if (!tripToStopSeq.has(tripId)) tripToStopSeq.set(tripId, []);
        tripToStopSeq.get(tripId).push({ stopId, seq });
      }
    });

  // Sort each trip's stops by sequence
  for (const [, arr] of tripToStopSeq) {
    arr.sort((a, b) => a.seq - b.seq);
  }

  // 4. Compute bearing at each stop per headsign using circular mean
  //    Key: "stopId|headsign" -> { sinSum, cosSum, count }
  const bearingAccum = new Map();
  for (const [tripId, seqArr] of tripToStopSeq) {
    const h = tripToHeadsign.get(tripId);
    if (!h || seqArr.length < 2) continue;
    for (let i = 0; i < seqArr.length; i++) {
      const cur = stopsMap.get(seqArr[i].stopId);
      // Use next stop for bearing; for last stop use previous
      const neighbor = i < seqArr.length - 1
        ? stopsMap.get(seqArr[i + 1].stopId)
        : stopsMap.get(seqArr[i - 1].stopId);
      if (!cur || !neighbor) continue;
      const bearing = i < seqArr.length - 1
        ? computeBearing(cur.lat, cur.lon, neighbor.lat, neighbor.lon)
        : computeBearing(neighbor.lat, neighbor.lon, cur.lat, cur.lon);
      const key = `${seqArr[i].stopId}|${h}`;
      const rad = (bearing * Math.PI) / 180;
      if (!bearingAccum.has(key)) {
        bearingAccum.set(key, { sinSum: 0, cosSum: 0, count: 0 });
      }
      const acc = bearingAccum.get(key);
      acc.sinSum += Math.sin(rad);
      acc.cosSum += Math.cos(rad);
      acc.count++;
    }
  }

  // Resolve circular means to degree bearings
  const bearingMap = new Map(); // "stopId|headsign" -> bearing (0-360)
  for (const [key, { sinSum, cosSum }] of bearingAccum) {
    const avgRad = Math.atan2(sinSum, cosSum);
    bearingMap.set(key, ((avgRad * 180) / Math.PI + 360) % 360);
  }

  // 5. Join: for each routeId -> all unique stops with served headsigns + bearings
  for (const [routeId, tripIds] of routeToTrips) {
    const stopSet = new Set();
    const stopHeadsigns = new Map(); // stopId -> Set<headsign>
    for (const tripId of tripIds) {
      const stopIds = tripToStops.get(tripId);
      const h = tripToHeadsign.get(tripId);
      if (stopIds) {
        for (const stopId of stopIds) {
          stopSet.add(stopId);
          if (h) {
            if (!stopHeadsigns.has(stopId)) stopHeadsigns.set(stopId, new Set());
            stopHeadsigns.get(stopId).add(h);
          }
        }
      }
    }
    const stops = [];
    for (const stopId of stopSet) {
      const info = stopsMap.get(stopId);
      if (info) {
        const headsigns = [...(stopHeadsigns.get(stopId) || [])];
        const bearings = {};
        for (const h of headsigns) {
          const b = bearingMap.get(`${stopId}|${h}`);
          if (b != null) bearings[h] = Math.round(b);
        }
        stops.push({
          stopId,
          stopName: info.stopName,
          lat: info.lat,
          lon: info.lon,
          headsigns,
          bearings,
        });
      }
    }
    routeToStopsCache.set(routeId, stops);
  }

  cachePopulated = true;
  console.log(
    `[StopsService] Cache built in ${Date.now() - start}ms — ${routeToStopsCache.size} routes indexed.`
  );
};

export const getStopsForRoutes = (routeIds) => {
  buildCache();
  const result = {};
  for (const routeId of routeIds) {
    result[routeId] = routeToStopsCache.get(routeId) || [];
  }
  return result;
};

// Warm up cache at startup
export const warmUpCache = () => {
  setImmediate(buildCache);
};
