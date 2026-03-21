import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GTFS_DIR = path.join(__dirname, "../data/gtfsdata");

// Cache: routeId -> [{stopId, stopName, lat, lon}]
const routeToStopsCache = new Map();
let cachePopulated = false;

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

  // 2. Parse trips.txt -> routeToTrips: Map<routeId, Set<tripId>>
  const routeToTrips = new Map();
  const tripsData = fs.readFileSync(path.join(GTFS_DIR, "trips.txt"), "utf8");
  tripsData
    .split("\n")
    .slice(1)
    .filter((line) => line.trim())
    .forEach((line) => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const routeId = cols[0];
      const tripId = cols[2];
      if (!routeToTrips.has(routeId)) routeToTrips.set(routeId, new Set());
      routeToTrips.get(routeId).add(tripId);
    });

  // 3. Parse stop_times.txt -> tripToStops: Map<tripId, Set<stopId>>
  const tripToStops = new Map();
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
      if (tripId && stopId) {
        if (!tripToStops.has(tripId)) tripToStops.set(tripId, new Set());
        tripToStops.get(tripId).add(stopId);
      }
    });

  // 4. Join: for each routeId -> all unique stops
  for (const [routeId, tripIds] of routeToTrips) {
    const stopSet = new Set();
    for (const tripId of tripIds) {
      const stopIds = tripToStops.get(tripId);
      if (stopIds) {
        for (const stopId of stopIds) stopSet.add(stopId);
      }
    }
    const stops = [];
    for (const stopId of stopSet) {
      const info = stopsMap.get(stopId);
      if (info) {
        stops.push({ stopId, stopName: info.stopName, lat: info.lat, lon: info.lon });
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
