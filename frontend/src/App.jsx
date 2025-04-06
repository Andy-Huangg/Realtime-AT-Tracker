import React, { useState, useEffect, useMemo } from "react";
import BusMap from "./components/BusMap.jsx";
import "./App.css";
import { parseRoutes } from "./utils/routeUtils.js";

const API_URL = import.meta.env.VITE_API_URL;
const FETCH_INTERVAL = 30000;

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const routes = useMemo(() => parseRoutes(), []);

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

  return (
    <div className="App">
      <div className="status-overlay">
        <h3>Auckland Live Bus Tracker</h3>
        {isLoading && <p>Loading initial data...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && (
          <>
            <p>
              Displaying {vehicles.length} / {vehicles.length} buses. Last
              update:{" "}
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "N/A"}
            </p>
          </>
        )}
      </div>

      <BusMap vehicles={vehicles} />
    </div>
  );
}

export default App;
