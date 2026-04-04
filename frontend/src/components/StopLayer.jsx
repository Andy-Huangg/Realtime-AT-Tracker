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
          // Merge headsigns and bearings from this route
          for (const h of stop.headsigns || []) {
            existing.headsignSet.add(h);
          }
          Object.assign(existing.bearings, stop.bearings || {});
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
            bearings: { ...(stop.bearings || {}) },
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
    const bearings = stop.bearings || {};
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
                      {headsigns.map((h, i) => (
                        <span key={h}>
                          {i > 0 && ", "}
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ verticalAlign: "middle", transform: bearings[h] != null ? `rotate(${bearings[h] - 90}deg)` : undefined }}>
                            <path d="M2 5h6M5.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {" "}{h}
                        </span>
                      ))}
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
