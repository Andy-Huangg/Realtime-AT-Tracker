import React, { useState, useEffect, useMemo } from "react";
import BusMap from "./components/BusMap.jsx";
import Sidebar from "./components/Sidebar.jsx";
import "./App.css";
import { parseRoutes } from "./utils/routeUtils.js";

const API_URL = import.meta.env.VITE_API_URL;
const FETCH_INTERVAL = 30000;

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const routes = useMemo(() => parseRoutes(), []);

  // Fetch all vehicles from the backend
  const fetchVehicleData = async () => {
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/vehicles`);

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          // Intentionally left empty to ignore JSON parsing errors
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();

      setVehicles(data.vehicles || []);
      setLastUpdate(data.lastUpdate);
    } catch (error) {
      console.error("Failed to fetch vehicle data:", error);
      setError(error.message);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  // Effect for initial fetch and interval
  useEffect(() => {
    fetchVehicleData();
    const intervalId = setInterval(fetchVehicleData, FETCH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  // Filter vehicles on selected routes
  const filteredVehicles = useMemo(() => {
    if (selectedRouteIds.length === 0) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      selectedRouteIds.includes(vehicle.routeId)
    );
  }, [selectedRouteIds, vehicles]);

  const handleRouteChange = (newSelectedIds) => {
    setSelectedRouteIds(newSelectedIds);
  };

  return (
    <div className="App">
      <Sidebar
        isLoading={isLoading}
        error={error}
        vehicles={vehicles}
        lastUpdate={lastUpdate}
        routes={routes}
        selectedRouteIds={selectedRouteIds}
        onRouteChange={handleRouteChange}
      />
      <BusMap vehicles={filteredVehicles} />
    </div>
  );
}

export default App;
