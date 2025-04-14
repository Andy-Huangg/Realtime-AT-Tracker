import {
  getRouteShape,
  getMultipleRouteShapes,
} from "../services/routeService.js";

export const getRouteShapes = (req, res) => {
  try {
    // Get route IDs from query params (either single id or array)
    const { routeIds } = req.query;

    if (!routeIds) {
      return res.status(400).json({
        message: "Route ID is required.",
      });
    }

    // Handle both single routeId and multiple routeIds
    let routeIdArray = [];
    try {
      routeIdArray = JSON.parse(routeIds);
      if (!Array.isArray(routeIdArray)) {
        routeIdArray = [routeIdArray];
      }
    } catch (e) {
      // If JSON.parse fails, it's a single string
      routeIdArray = [routeIds];
    }

    const shapes = getMultipleRouteShapes(routeIdArray);

    res.status(200).json({
      message: "Route shapes fetched successfully.",
      shapes,
    });
  } catch (error) {
    console.error("Error retrieving route shapes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleRouteShape = (req, res) => {
  try {
    const { routeId } = req.params;

    if (!routeId) {
      return res.status(400).json({
        message: "Route ID is required.",
      });
    }

    const shape = getRouteShape(routeId);

    res.status(200).json({
      message: "Route shape fetched successfully.",
      shape,
    });
  } catch (error) {
    console.error("Error retrieving route shape:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
