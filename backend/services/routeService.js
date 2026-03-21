import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for route shapes to improve performance
const routeShapesCache = new Map();

// Cache for trip headsigns: tripId -> headsign string
const tripHeadsignsCache = new Map();

// Function to parse the shapes.txt file
const parseShapesFile = () => {
  try {
    const shapesFilePath = path.join(__dirname, "../data/gtfsdata/shapes.txt");
    const shapesData = fs.readFileSync(shapesFilePath, "utf8");

    // Group shapes by shape_id
    const shapePoints = {};
    shapesData
      .split("\n")
      .slice(1) // Skip header
      .filter((line) => line.trim())
      .forEach((line) => {
        const columns = line.split(",");
        const [shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence] =
          columns;

        if (!shapePoints[shape_id]) {
          shapePoints[shape_id] = [];
        }

        shapePoints[shape_id].push({
          lat: parseFloat(shape_pt_lat),
          lng: parseFloat(shape_pt_lon),
          seq: parseInt(shape_pt_sequence, 10),
        });
      });

    // Sort points by sequence number, then strip seq from output
    Object.keys(shapePoints).forEach((shapeId) => {
      shapePoints[shapeId].sort((a, b) => a.seq - b.seq);
      shapePoints[shapeId] = shapePoints[shapeId].map(({ lat, lng }) => ({ lat, lng }));
    });

    return shapePoints;
  } catch (error) {
    console.error("Error parsing shapes file:", error);
    return {};
  }
};

// Function to parse the trips.txt file to get the relationship between routes and shapes
const parseTripsFile = () => {
  try {
    const tripsFilePath = path.join(__dirname, "../data/gtfsdata/trips.txt");
    const tripsData = fs.readFileSync(tripsFilePath, "utf8");

    // Map route_ids to shape_ids; also capture tripId -> headsign
    const routeToShapes = {};
    const tripHeadsigns = {};
    tripsData
      .split("\n")
      .slice(1) // Skip header
      .filter((line) => line.trim())
      .forEach((line) => {
        const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        // trips.txt: route_id(0), service_id(1), trip_id(2), trip_headsign(3), ..., shape_id(7)
        const route_id = columns[0];
        const trip_id = columns[2];
        const headsign = columns[3]?.replace(/^"|"$/g, "").trim();
        const shape_id = columns[7];

        if (!routeToShapes[route_id]) {
          routeToShapes[route_id] = new Set();
        }
        if (shape_id) {
          routeToShapes[route_id].add(shape_id);
        }
        if (trip_id && headsign) {
          tripHeadsigns[trip_id] = headsign;
        }
      });

    // Convert sets to arrays
    Object.keys(routeToShapes).forEach((routeId) => {
      routeToShapes[routeId] = Array.from(routeToShapes[routeId]);
    });

    return { routeToShapes, tripHeadsigns };
  } catch (error) {
    console.error("Error parsing trips file:", error);
    return {};
  }
};

// Function to get shape data for a specific route
export const getRouteShape = (routeId) => {
  // Check cache first
  if (routeShapesCache.has(routeId)) {
    return routeShapesCache.get(routeId);
  }

  // If not in cache, compute and cache
  if (routeShapesCache.size === 0) {
    // Load all shape data
    const shapePoints = parseShapesFile();
    const { routeToShapes, tripHeadsigns } = parseTripsFile();

    Object.entries(tripHeadsigns).forEach(([tid, h]) => tripHeadsignsCache.set(tid, h));

    // Populate cache for all routes
    Object.keys(routeToShapes).forEach((rid) => {
      const shapeIds = routeToShapes[rid];
      const routeShapes = shapeIds.map((shapeId) => ({
        shapeId,
        points: shapePoints[shapeId] || [],
      }));
      routeShapesCache.set(rid, routeShapes);
    });
  }

  return routeShapesCache.get(routeId) || [];
};

// Preload all route shapes and trip headsigns into cache at startup
export const preloadRouteShapes = () => {
  if (routeShapesCache.size > 0) return;
  const shapePoints = parseShapesFile();
  const { routeToShapes, tripHeadsigns } = parseTripsFile();
  Object.entries(tripHeadsigns).forEach(([tid, h]) => tripHeadsignsCache.set(tid, h));
  Object.keys(routeToShapes).forEach((rid) => {
    const shapeIds = routeToShapes[rid];
    const routeShapes = shapeIds.map((shapeId) => ({
      shapeId,
      points: shapePoints[shapeId] || [],
    }));
    routeShapesCache.set(rid, routeShapes);
  });
  console.log(`Route shapes preloaded: ${routeShapesCache.size} routes, ${tripHeadsignsCache.size} trip headsigns`);
};

// Look up a trip's headsign (destination) by tripId
export const getTripHeadsign = (tripId) => tripHeadsignsCache.get(tripId) || null;

// Function to get shape data for multiple routes
export const getMultipleRouteShapes = (routeIds) => {
  const shapes = {};
  routeIds.forEach((routeId) => {
    shapes[routeId] = getRouteShape(routeId);
  });
  return shapes;
};
