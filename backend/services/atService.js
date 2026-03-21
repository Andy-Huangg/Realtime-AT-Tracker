import axios from "axios";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { getTripHeadsign } from "./routeService.js";

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

class AtService extends EventEmitter {
  constructor() {
    super();
    this.latestBusData = [];
    this.lastUpdateTime = null;
  }

  start() {
    this.fetch();
    setInterval(() => this.fetch(), 29000);
  }

  async fetch() {
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
            const tripId = vehicle.trip?.tripId || null;
            return {
              id: entity.id,
              vehicleId: vehicle.vehicle?.id || null,
              tripId,
              routeId: vehicle.trip?.routeId || null,
              headsign: getTripHeadsign(tripId),
              latitude: vehicle.position.latitude,
              longitude: vehicle.position.longitude,
              bearing: vehicle.position.bearing,
              speed: vehicle.position.speed,
              timestamp: vehicle.timestamp
                ? new Date(Number(vehicle.timestamp.low) * 1000)
                : null,
            };
          });

        this.latestBusData = processedData;
        this.lastUpdateTime = new Date();
        console.log(
          `[${new Date().toISOString()}] Successfully fetched and processed ${
            this.latestBusData.length
          } vehicle positions.`
        );
        this.emit("vehicleUpdate", {
          vehicles: this.latestBusData,
          lastUpdate: this.lastUpdateTime,
        });
      } else {
        console.error(
          `[${new Date().toISOString()}] Error fetching data: Status code ${
            response.status
          }`
        );
      }
    } catch (error) {
      if (error.response) {
        console.error(
          `[${new Date().toISOString()}] AT API Error: Status ${
            error.response.status
          }`,
          error.response.data
            ? Buffer.from(error.response.data).toString()
            : "No data"
        );
      } else if (error.request) {
        console.error(
          `[${new Date().toISOString()}] AT API Error: No response received`,
          error.request
        );
      } else {
        console.error(
          `[${new Date().toISOString()}] Error fetching or parsing AT data:`,
          error.message
        );
      }
    }
  }

  getLatestBusData() {
    return {
      data: this.latestBusData,
      lastUpdate: this.lastUpdateTime,
    };
  }
}

export default new AtService();
