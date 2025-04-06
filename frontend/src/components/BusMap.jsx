import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const BusMap = ({ vehicles }) => {
  const mapCenter = [-36.8485, 174.7633]; // implement user location later.
  const bounds = [
    [-37.6, 173],
    [-36, 176],
  ];

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
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

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
