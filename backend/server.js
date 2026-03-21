import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import vehicleRouter from "./routes/vehicles.js";
import routeRouter from "./routes/routes.js";
import stopsRouter from "./routes/stops.js";
import atService from "./services/atService.js";
import { warmUpCache } from "./services/stopsService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.use("/api/vehicles", vehicleRouter);
app.use("/api/routes", routeRouter);
app.use("/api/stops", stopsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "http://localhost:5173" },
});

atService.on("vehicleUpdate", (payload) => {
  io.emit("vehicleUpdate", payload);
});

atService.start();
warmUpCache();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
