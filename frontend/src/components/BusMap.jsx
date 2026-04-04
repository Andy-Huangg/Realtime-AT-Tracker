import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Polyline,
  useMap,
} from "react-leaflet";
import { createVehicleIcon, getRouteColor } from "../utils/routeUtils";
import { MAP_STYLES, DEFAULT_STYLE_ID } from "../utils/mapStyles";
import StopLayer from "./StopLayer";

const BusMap = ({
  vehicles,
  selectedRouteIds = [],
  routes,
  routeStops,
  selectedStop,
  onStopSelect,
  tileConfig,
  stopsVisible,
  onStopsVisibleChange,
}) => {
  const mapCenter = [-36.8485, 174.7633];
  const bounds = [[-37.6, 173], [-36, 176]];
  const [routeShapes, setRouteShapes] = useState({});
  const shapeCacheRef = useRef({});

  const activeTile = tileConfig || MAP_STYLES[DEFAULT_STYLE_ID];

  const getVehicleType = (routeId) => {
    const route = routes?.find((r) => r.route_id === routeId);
    return route?.transport_type || "BUS";
  };

  useEffect(() => {
    if (!selectedRouteIds.length) { setRouteShapes({}); return; }

    const missing = selectedRouteIds.filter((id) => !shapeCacheRef.current[id]);

    const applySelection = () => {
      const visible = {};
      selectedRouteIds.forEach((id) => {
        if (shapeCacheRef.current[id]) visible[id] = shapeCacheRef.current[id];
      });
      setRouteShapes(visible);
    };

    if (!missing.length) { applySelection(); return; }

    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/routes?routeIds=${JSON.stringify(missing)}`)
      .then((r) => r.json())
      .then((d) => {
        Object.assign(shapeCacheRef.current, d.shapes || {});
        applySelection();
      })
      .catch((e) => console.error("Error fetching route shapes:", e));
  }, [selectedRouteIds]);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
    <button
      className={`stops-toggle-btn ${stopsVisible ? "active" : ""}`}
      onClick={() => onStopsVisibleChange((v) => !v)}
      title={stopsVisible ? "Hide stops" : "Show stops"}
      aria-label={stopsVisible ? "Hide stops" : "Show stops"}
    >
      {stopsVisible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      )}
      <span>{stopsVisible ? "Hide Stops" : "Show Stops"}</span>
    </button>
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={10}
      maxZoom={18}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={0.8}
      zoomControl={false}
    >
      <TileLayer
        key={activeTile.id}
        attribution={activeTile.attribution}
        url={activeTile.url}
      />
      <ZoomControl position="bottomright" />

      {/* Route polylines */}
      {Object.entries(routeShapes).map(([routeId, shapes]) =>
        shapes.map((shape, i) =>
          shape.points?.length > 0 ? (
            <Polyline
              key={`${routeId}-${i}`}
              positions={shape.points.map((p) => [p.lat, p.lng])}
              color={getRouteColor(routeId)}
              weight={3}
              opacity={0.65}
            >
              <Popup>
                <div className="vehicle-popup-route" style={{ background: getRouteColor(routeId) }}>
                  Route {routeId}
                </div>
              </Popup>
            </Polyline>
          ) : null
        )
      )}

      {/* Stop markers */}
      <StopLayer routeStops={routeStops} selectedStop={selectedStop} onStopSelect={onStopSelect} stopsVisible={stopsVisible} />

      {/* Vehicle markers — individual, no clustering */}
      {vehicles.map((v) => {
        if (!v.latitude || !v.longitude || !v.routeId) return null;
        const color = getRouteColor(v.routeId);
        return (
          <Marker
            key={v.id}
            position={[v.latitude, v.longitude]}
            icon={createVehicleIcon(color, v.bearing, getVehicleType(v.routeId))}
            zIndexOffset={1000}
          >
            <Popup maxWidth={220}>
              <div className="vehicle-popup-route" style={{ background: color }}>
                Route {v.routeId}
              </div>
              <div className="vehicle-popup-body">
                <div className="vehicle-popup-row">
                  <span className="vehicle-popup-label">Vehicle</span>
                  <span className="vehicle-popup-value">{v.vehicleId || "—"}</span>
                </div>
                <div className="vehicle-popup-row">
                  <span className="vehicle-popup-label">Speed</span>
                  <span className="vehicle-popup-value">{v.speed != null ? v.speed.toFixed(1) + " km/h" : "—"}</span>
                </div>
                <div className="vehicle-popup-row">
                  <span className="vehicle-popup-label">Bearing</span>
                  <span className="vehicle-popup-value">{v.bearing != null ? v.bearing.toFixed(0) + "°" : "—"}</span>
                </div>
                <div className="vehicle-popup-row">
                  <span className="vehicle-popup-label">Updated</span>
                  <span className="vehicle-popup-value">{new Date(v.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
    </div>
  );
};

export default BusMap;
