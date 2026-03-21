import React, { useMemo, useState, useEffect } from "react";
import { CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";

const MIN_ZOOM_FOR_STOPS = 12;

const StopLayer = ({ routeStops, selectedStop, onStopSelect }) => {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(() => map.getZoom());

  useEffect(() => {
    setCurrentZoom(map.getZoom());
  }, [map]);

  useMapEvents({
    zoomend: (e) => setCurrentZoom(e.target.getZoom()),
  });

  const uniqueStops = useMemo(() => {
    const seen = new Set();
    const stops = [];
    for (const routeId of Object.keys(routeStops || {})) {
      for (const stop of routeStops[routeId] || []) {
        if (!seen.has(stop.stopId)) {
          seen.add(stop.stopId);
          stops.push(stop);
        }
      }
    }
    return stops;
  }, [routeStops]);

  if (currentZoom < MIN_ZOOM_FOR_STOPS) return null;

  return uniqueStops.map((stop) => {
    const isSelected = selectedStop?.stopId === stop.stopId;
    return (
      <CircleMarker
        key={stop.stopId}
        center={[stop.lat, stop.lon]}
        radius={isSelected ? 9 : 5}
        fillColor="#00b1bf"
        fillOpacity={isSelected ? 1 : 0.75}
        color={isSelected ? "#fff" : "#00b1bf"}
        weight={isSelected ? 2 : 1}
        eventHandlers={{
          click: () => onStopSelect(isSelected ? null : stop),
        }}
      >
        <Popup>
          <b>{stop.stopName}</b><br />
          <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{stop.stopId}</span>
        </Popup>
      </CircleMarker>
    );
  });
};

export default StopLayer;
