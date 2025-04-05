import express from "express";
import { getLiveVehiclePositions } from "../controllers/vehicleController.js";

const router = express.Router();

router.get("/", getLiveVehiclePositions);

export default router;
