import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
    </MapContainer>
  );
};

export default BusMap;
