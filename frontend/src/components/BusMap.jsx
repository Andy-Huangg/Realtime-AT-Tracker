import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import busIconpng from "../assets/bus.png";
import directionIconpng from "../assets/direction.png";

import "leaflet-rotatedmarker";
import RotatingBusMarker from "./RotatingBusMarker";

const busIcon = new L.Icon({
  iconUrl: busIconpng,
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [1, -34],
});

const directionIcon = new L.Icon({
  iconUrl: directionIconpng,
  iconSize: [20, 20],
  iconAnchor: [10, 30],
});

const BusMap = ({ vehicles, selectedRouteIds = [] }) => {
  const mapCenter = [-36.8485, 174.7633]; // implement user location later.
  const bounds = [
    [-37.6, 173],
    [-36, 176],
  ];
  const [routeShapes, setRouteShapes] = useState({});

  // Fetch route shapes when selectedRouteIds changes
  useEffect(() => {
    const fetchRouteShapes = async () => {
      if (!selectedRouteIds.length) {
        setRouteShapes({});
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${API_URL}/api/routes?routeIds=${JSON.stringify(selectedRouteIds)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch route shapes: ${response.status}`);
        }

        const data = await response.json();
        setRouteShapes(data.shapes || {});
      } catch (error) {
        console.error("Error fetching route shapes:", error);
      }
    };

    fetchRouteShapes();
  }, [selectedRouteIds]);

  // Generates a random color for each route
  const getRouteColor = (routeId) => {
    // Generate a deterministic color based on the routeId
    const hash = routeId.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={11}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%" }}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      {/* Render route outlines */}
      {Object.entries(routeShapes).map(([routeId, shapes]) =>
        shapes.map((shape, shapeIndex) =>
          shape.points && shape.points.length > 0 ? (
            <Polyline
              key={`${routeId}-${shapeIndex}`}
              positions={shape.points.map((point) => [point.lat, point.lng])}
              color={getRouteColor(routeId)}
              weight={4}
              opacity={0.7}
            >
              <Popup>
                <b>Route ID:</b> {routeId}
              </Popup>
            </Polyline>
          ) : null
        )
      )}
      {/* Render vehicle icons */}
      {vehicles.map((vehicle) =>
        vehicle.latitude && vehicle.longitude && vehicle.routeId ? (
          <React.Fragment key={vehicle.id}>
            <Marker
              position={[vehicle.latitude, vehicle.longitude]}
              icon={busIcon}
              zIndexOffset={1500}
            >
              <Popup>
                <b>Vehicle ID:</b> {vehicle.vehicleId || "N/A"} <br />
                <b>Route ID:</b> {vehicle.routeId || "N/A"} <br />
                <b>Trip ID:</b> {vehicle.tripId || "N/A"} <br />
                <b>Speed:</b>{" "}
                {vehicle.speed ? `${vehicle.speed.toFixed(1)} km/h` : "N/A"}{" "}
                <br />
                <b>Bearing:</b>
                {vehicle.bearing !== null && vehicle.bearing !== undefined
                  ? `${vehicle.bearing.toFixed(0)}°`
                  : "N/A"}{" "}
                <br />
                <b>Timestamp:</b>{" "}
                {new Date(vehicle.timestamp).toLocaleTimeString()}
              </Popup>
            </Marker>
            {vehicle.bearing !== null && vehicle.bearing !== undefined && (
              <RotatingBusMarker
                position={[vehicle.latitude, vehicle.longitude]}
                icon={directionIcon}
                rotationAngle={vehicle.bearing}
                rotationOrigin="bottom center"
                zIndexOffset={1400}
              />
            )}
          </React.Fragment>
        ) : null
      )}
    </MapContainer>
  );
};

export default BusMap;
