import { getStopsForRoutes } from "../services/stopsService.js";

export const getStopsForRouteIds = (req, res) => {
  try {
    const { routeIds } = req.query;
    if (!routeIds) {
      return res.status(400).json({ message: "routeIds query param required" });
    }

    let parsedIds;
    try {
      parsedIds = JSON.parse(routeIds);
    } catch {
      return res.status(400).json({ message: "routeIds must be a JSON array" });
    }

    if (!Array.isArray(parsedIds)) {
      return res.status(400).json({ message: "routeIds must be an array" });
    }

    const stops = getStopsForRoutes(parsedIds);
    res.status(200).json({ stops });
  } catch (error) {
    console.error("Error retrieving stops:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
