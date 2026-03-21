import React, { useEffect, useState } from "react";
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
}) => {
  const mapCenter = [-36.8485, 174.7633];
  const bounds = [[-37.6, 173], [-36, 176]];
  const [routeShapes, setRouteShapes] = useState({});

  const activeTile = tileConfig || MAP_STYLES[DEFAULT_STYLE_ID];

  const getVehicleType = (routeId) => {
    const route = routes?.find((r) => r.route_id === routeId);
    return route?.transport_type || "BUS";
  };

  useEffect(() => {
    if (!selectedRouteIds.length) { setRouteShapes({}); return; }
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/routes?routeIds=${JSON.stringify(selectedRouteIds)}`)
      .then((r) => r.json())
      .then((d) => setRouteShapes(d.shapes || {}))
      .catch((e) => console.error("Error fetching route shapes:", e));
  }, [selectedRouteIds]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={10}
      maxZoom={16}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%" }}
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
      <StopLayer routeStops={routeStops} selectedStop={selectedStop} onStopSelect={onStopSelect} />

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
  );
};

export default BusMap;
