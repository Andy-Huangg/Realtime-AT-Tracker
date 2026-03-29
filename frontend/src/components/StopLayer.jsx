import React, { useMemo, useState, useEffect } from "react";
import { CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import { getRouteColor } from "../utils/routeUtils";

const MIN_ZOOM_FOR_STOPS = 12;

const StopLayer = ({ routeStops, selectedStop, onStopSelect, stopsVisible = true }) => {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(() => map.getZoom());

  useEffect(() => {
    setCurrentZoom(map.getZoom());
  }, [map]);

  useMapEvents({
    zoomend: (e) => setCurrentZoom(e.target.getZoom()),
  });

  // Deduplicate stops but merge headsigns and track serving routes
  const uniqueStops = useMemo(() => {
    const stopMap = new Map();
    for (const routeId of Object.keys(routeStops || {})) {
      for (const stop of routeStops[routeId] || []) {
        if (stopMap.has(stop.stopId)) {
          const existing = stopMap.get(stop.stopId);
          // Merge headsigns from this route
          for (const h of stop.headsigns || []) {
            existing.headsignSet.add(h);
          }
          // Track which routes serve this stop with their headsigns
          if (!existing.routeHeadsigns[routeId]) {
            existing.routeHeadsigns[routeId] = [];
          }
          for (const h of stop.headsigns || []) {
            if (!existing.routeHeadsigns[routeId].includes(h)) {
              existing.routeHeadsigns[routeId].push(h);
            }
          }
        } else {
          stopMap.set(stop.stopId, {
            ...stop,
            headsignSet: new Set(stop.headsigns || []),
            routeHeadsigns: {
              [routeId]: [...(stop.headsigns || [])],
            },
          });
        }
      }
    }
    return Array.from(stopMap.values());
  }, [routeStops]);

  if (currentZoom < MIN_ZOOM_FOR_STOPS || !stopsVisible) return null;

  return uniqueStops.map((stop) => {
    const isSelected = selectedStop?.stopId === stop.stopId;
    const routeEntries = Object.entries(stop.routeHeadsigns || {});
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
          <div className="stop-popup">
            <div className="stop-popup-name">{stop.stopName}</div>
            <div className="stop-popup-id">{stop.stopId}</div>
            {routeEntries.length > 0 && (
              <div className="stop-popup-directions">
                {routeEntries.map(([routeId, headsigns]) => (
                  <div key={routeId} className="stop-popup-route">
                    <span
                      className="stop-popup-badge"
                      style={{ background: getRouteColor(routeId) }}
                    >
                      {routeId}
                    </span>
                    <span className="stop-popup-headsigns">
                      {headsigns.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Popup>
      </CircleMarker>
    );
  });
};

export default StopLayer;
