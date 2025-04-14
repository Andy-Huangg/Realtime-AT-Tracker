import express from "express";
import {
  getRouteShapes,
  getSingleRouteShape,
} from "../controllers/routeController.js";

const router = express.Router();

// Route to get shapes for multiple routes
router.get("/", getRouteShapes);

// Route to get shape for a single route
router.get("/:routeId", getSingleRouteShape);

export default router;
