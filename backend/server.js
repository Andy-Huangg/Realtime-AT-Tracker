import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vehicleRouter from "./routes/vehicles.js";
import routeRouter from "./routes/routes.js";

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
