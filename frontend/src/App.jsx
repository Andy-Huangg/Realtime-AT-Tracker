import React, { useState, useEffect, useMemo } from "react";
import BusMap from "./components/BusMap.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MapStyleSelector from "./components/MapStyleSelector.jsx";
import "./App.css";
import { parseRoutes } from "./utils/routeUtils.js";
import { useSocket } from "./hooks/useSocket.js";
import { MAP_STYLES, DEFAULT_STYLE_ID } from "./utils/mapStyles.js";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const routes = useMemo(() => parseRoutes(), []);
  const { vehicles, lastUpdate, connectionStatus } = useSocket(API_URL);

  const [selectedRouteIds, setSelectedRouteIds] = useState(() => {
    const saved = localStorage.getItem("selectedRoutes");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedStop, setSelectedStop] = useState(null);
  const [routeStops, setRouteStops] = useState({});
  const [mapStyleId, setMapStyleId] = useState(DEFAULT_STYLE_ID);

  useEffect(() => {
    localStorage.setItem("selectedRoutes", JSON.stringify(selectedRouteIds));
  }, [selectedRouteIds]);

  useEffect(() => {
    if (selectedRouteIds.length === 0) {
      setRouteStops({});
      return;
    }
    fetch(`${API_URL}/api/stops?routeIds=${JSON.stringify(selectedRouteIds)}`)
      .then((r) => r.json())
      .then((d) => setRouteStops(d.stops || {}))
      .catch((err) => console.error("Failed to fetch stops:", err));
  }, [selectedRouteIds]);

  const filteredVehicles = useMemo(() => {
    if (selectedRouteIds.length === 0) return [];
    return vehicles.filter((v) => selectedRouteIds.includes(v.routeId));
  }, [selectedRouteIds, vehicles]);

  return (
    <div className="App">
      <Sidebar
        vehicles={vehicles}
        filteredVehicles={filteredVehicles}
        lastUpdate={lastUpdate}
        connectionStatus={connectionStatus}
        routes={routes}
        selectedRouteIds={selectedRouteIds}
        onRouteChange={setSelectedRouteIds}
        selectedStop={selectedStop}
        onStopSelect={setSelectedStop}
        routeStops={routeStops}
      />
      <BusMap
        vehicles={filteredVehicles}
        selectedRouteIds={selectedRouteIds}
        routes={routes}
        routeStops={routeStops}
        selectedStop={selectedStop}
        onStopSelect={setSelectedStop}
        tileConfig={MAP_STYLES[mapStyleId]}
      />
      <MapStyleSelector
        currentStyleId={mapStyleId}
        onStyleChange={setMapStyleId}
      />
    </div>
  );
}

export default App;
