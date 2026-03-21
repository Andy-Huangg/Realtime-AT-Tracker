import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { createVehicleIcon, getRouteColor, createClusterIcon } from "../utils/routeUtils";
import { MAP_STYLES, DEFAULT_STYLE_ID } from "../utils/mapStyles";
import StopLayer from "./StopLayer";

const ClusterLayer = ({ vehicles, routes }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  const getVehicleType = (routeId) => {
    const route = routes?.find((r) => r.route_id === routeId);
    return route?.transport_type || "BUS";
  };

  useEffect(() => {
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
        iconCreateFunction: createClusterIcon,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });
      map.addLayer(clusterGroupRef.current);
    }

    const group = clusterGroupRef.current;
    group.clearLayers();

    vehicles.forEach((v) => {
      if (!v.latitude || !v.longitude || !v.routeId) return;

      const color = getRouteColor(v.routeId);
      const icon = createVehicleIcon(color, v.bearing, getVehicleType(v.routeId));
      const marker = L.marker([v.latitude, v.longitude], { icon, zIndexOffset: 1000 });

      // Styled popup HTML
      marker.bindPopup(`
        <div class="vehicle-popup-route" style="background:${color}">
          Route ${v.routeId || "N/A"}
        </div>
        <div class="vehicle-popup-body">
          <div class="vehicle-popup-row">
            <span class="vehicle-popup-label">Vehicle</span>
            <span class="vehicle-popup-value">${v.vehicleId || "—"}</span>
          </div>
          <div class="vehicle-popup-row">
            <span class="vehicle-popup-label">Speed</span>
            <span class="vehicle-popup-value">${v.speed != null ? v.speed.toFixed(1) + " km/h" : "—"}</span>
          </div>
          <div class="vehicle-popup-row">
            <span class="vehicle-popup-label">Bearing</span>
            <span class="vehicle-popup-value">${v.bearing != null ? v.bearing.toFixed(0) + "°" : "—"}</span>
          </div>
          <div class="vehicle-popup-row">
            <span class="vehicle-popup-label">Updated</span>
            <span class="vehicle-popup-value">${new Date(v.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      `, { maxWidth: 220 });

      group.addLayer(marker);
    });

    return () => group.clearLayers();
  }, [vehicles, map, routes]);

  useEffect(() => {
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map]);

  return null;
};

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

      <StopLayer routeStops={routeStops} selectedStop={selectedStop} onStopSelect={onStopSelect} />
      <ClusterLayer vehicles={vehicles} routes={routes} />
    </MapContainer>
  );
};

export default BusMap;
