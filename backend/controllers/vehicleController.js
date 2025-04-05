import { getLatestBusData } from "../services/atService.js";

export const getLiveVehiclePositions = (req, res) => {
  try {
    const data = getLatestBusData();
    if (!data.lastUpdate) {
      return res.status(503).json({
        message:
          "Vehicle data is currently unavailable. Please try again shortly.",
        lastUpdate: null,
        vehicles: [],
      });
    }

    res.status(200).json({
      message: "Latest vehicle positions fetched successfully.",
      lastUpdate: data.lastUpdate,
      vehicles: data.data,
    });
  } catch (error) {
    console.error("Error retrieving vehicle positions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
