import axios from "axios";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import dotenv from "dotenv";

dotenv.config();

const AT_API_KEY = process.env.AT_API_KEY;
const AT_VEHICLE_POSITIONS_URL =
  "https://api.at.govt.nz/realtime/legacy/vehiclelocations";

if (!AT_API_KEY) {
  console.error(
    "Error: AT_API_KEY is not defined in the environment variables."
  );
  process.exit(1);
}

// In-memory storage for the latest bus data
let latestBusData = [];
let lastUpdateTime = null;

const fetchAndProcessBusData = async () => {
  console.log(
    `[${new Date().toISOString()}] Fetching latest vehicle positions...`
  );
  try {
    const response = await axios.get(AT_VEHICLE_POSITIONS_URL, {
      headers: {
        "Ocp-Apim-Subscription-Key": AT_API_KEY,
        Accept: "application/x-protobuf",
      },
      responseType: "arraybuffer",
    });

    if (response.status === 200 && response.data) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(response.data)
      );

      const processedData = feed.entity
        .filter((entity) => entity.vehicle && entity.vehicle.position)
        .map((entity) => {
          const { vehicle } = entity;
          return {
            id: entity.id,
            vehicleId: vehicle.vehicle?.id || null,
            tripId: vehicle.trip?.tripId || null,
            routeId: vehicle.trip?.routeId || null,
            latitude: vehicle.position.latitude,
            longitude: vehicle.position.longitude,
            bearing: vehicle.position.bearing,
            speed: vehicle.position.speed,
            timestamp: vehicle.timestamp
              ? new Date(Number(vehicle.timestamp.low) * 1000)
              : null,
          };
        });

      latestBusData = processedData;
      lastUpdateTime = new Date();
      console.log(
        `[${new Date().toISOString()}] Successfully fetched and processed ${
          latestBusData.length
        } vehicle positions.`
      );
    } else {
      console.error(
        `[${new Date().toISOString()}] Error fetching data: Status code ${
          response.status
        }`
      );
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        `[${new Date().toISOString()}] AT API Error: Status ${
          error.response.status
        }`,
        error.response.data
          ? Buffer.from(error.response.data).toString()
          : "No data"
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        `[${new Date().toISOString()}] AT API Error: No response received`,
        error.request
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(
        `[${new Date().toISOString()}] Error fetching or parsing AT data:`,
        error.message
      );
    }
  }
};

const getLatestBusData = () => {
  return {
    data: latestBusData,
    lastUpdate: lastUpdateTime,
  };
};

fetchAndProcessBusData();

// Schedule fetching every 30 seconds (as per AT API refresh cycle)
const FETCH_INTERVAL_MS = 29 * 1000;
setInterval(fetchAndProcessBusData, FETCH_INTERVAL_MS);

export { getLatestBusData };
