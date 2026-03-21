import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";

export function useSocket(url) {
  const socketRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  useEffect(() => {
    // Fetch initial data immediately so we don't wait up to 29s for first socket event
    fetch(`${url}/api/vehicles`)
      .then((r) => r.json())
      .then((d) => {
        if (d.vehicles) setVehicles(d.vehicles);
        if (d.lastUpdate) setLastUpdate(d.lastUpdate);
      })
      .catch((err) => console.error("Initial vehicle fetch failed:", err));

    const socket = io(url);
    socketRef.current = socket;

    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("connect_error", () => setConnectionStatus("error"));

    socket.on("vehicleUpdate", ({ vehicles, lastUpdate }) => {
      setVehicles(vehicles);
      setLastUpdate(lastUpdate);
    });

    return () => socket.disconnect();
  }, [url]);

  return {
    vehicles,
    lastUpdate,
    connectionStatus,
    isConnected: connectionStatus === "connected",
  };
}
