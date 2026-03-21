import express from "express";
import { getStopsForRouteIds } from "../controllers/stopsController.js";

const router = express.Router();

router.get("/", getStopsForRouteIds);

export default router;
