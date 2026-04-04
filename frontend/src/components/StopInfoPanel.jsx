import React, { useMemo } from "react";
import { haversineDistance, getRouteColor } from "../utils/routeUtils";
import "./StopInfoPanel.css";

const StopInfoPanel = ({ selectedStop, routeStops, filteredVehicles, onClose }) => {
  const approachingVehicles = useMemo(() => {
    if (!selectedStop) return [];

    const servingRoutes = Object.entries(routeStops || {})
      .filter(([, stops]) => stops.some((s) => s.stopId === selectedStop.stopId))
      .map(([routeId]) => routeId);

    return filteredVehicles
      .filter((v) => servingRoutes.includes(v.routeId) && v.latitude != null)
      .map((v) => {
        const distM = haversineDistance(v.latitude, v.longitude, selectedStop.lat, selectedStop.lon);
        const speedKmh = v.speed || 0;
        const eta = speedKmh > 1 ? (distM / 1000 / speedKmh) * 60 : null;
        return { ...v, distM, eta };
      })
      .sort((a, b) => a.distM - b.distM)
      .slice(0, 5);
  }, [selectedStop, routeStops, filteredVehicles]);

  // Aggregate served headsigns grouped by route for this stop (with bearings)
  const servedByRoute = useMemo(() => {
    if (!selectedStop) return [];
    const result = [];
    for (const [routeId, stops] of Object.entries(routeStops || {})) {
      const found = stops.find((s) => s.stopId === selectedStop.stopId);
      if (found?.headsigns?.length) {
        result.push({
          routeId,
          headsigns: [...found.headsigns].sort(),
          bearings: found.bearings || {},
        });
      }
    }
    return result.sort((a, b) => a.routeId.localeCompare(b.routeId));
  }, [selectedStop, routeStops]);

  return (
    <div className={`stop-panel ${selectedStop ? "visible" : ""}`}>
      {selectedStop && (
        <>
          <div className="stop-panel-header">
            <div className="stop-panel-header-left">
              <div className="stop-panel-dot" />
              <div>
                <div className="stop-panel-name">{selectedStop.stopName}</div>
                <div className="stop-panel-id">Stop {selectedStop.stopId}</div>
              </div>
            </div>
            <button className="stop-panel-close" onClick={onClose} aria-label="Close">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Served directions grouped by route */}
          {servedByRoute.length > 0 && (
            <div className="stop-panel-directions">
              <div className="stop-panel-directions-label">Serves</div>
              <div className="stop-panel-directions-routes">
                {servedByRoute.map(({ routeId, headsigns, bearings }) => (
                  <div key={routeId} className="stop-panel-route-group">
                    <span
                      className="stop-panel-route-badge"
                      style={{ background: getRouteColor(routeId) }}
                    >
                      {routeId}
                    </span>
                    <div className="stop-panel-route-headsigns">
                      {headsigns.map((h) => (
                        <span key={h} className="direction-tag">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transform: bearings[h] != null ? `rotate(${bearings[h] - 90}deg)` : undefined }}>
                            <path d="M2 5h6M5.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column headings */}
          <div className="stop-panel-cols">
            <span>Route &amp; Direction</span>
            <span>Distance</span>
            <span>ETA</span>
          </div>

          <div className="stop-panel-body">
            {approachingVehicles.length === 0 ? (
              <div className="stop-panel-empty">
                <span>No tracked vehicles currently approaching</span>
              </div>
            ) : (
              approachingVehicles.map((v, i) => {
                const etaClass =
                  v.eta == null ? "eta-stopped" :
                  v.eta < 3    ? "eta-soon" :
                  v.eta < 7    ? "eta-near" : "eta-far";

                const distStr = v.distM < 1000
                  ? `${Math.round(v.distM)} m`
                  : `${(v.distM / 1000).toFixed(1)} km`;

                const etaStr = v.eta != null
                  ? `${v.eta.toFixed(1)} min`
                  : "—";

                return (
                  <div key={v.id} className={`stop-departure ${i === 0 ? "first" : ""}`}>
                    {/* Route badge + headsign */}
                    <div className="departure-route">
                      <span
                        className="departure-badge"
                        style={{ background: getRouteColor(v.routeId) }}
                      >
                        {v.routeId}
                      </span>
                      {v.headsign && (
                        <span className="departure-headsign" title={v.headsign}>
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transform: v.bearing != null ? `rotate(${v.bearing - 90}deg)` : undefined }}>
                            <path d="M2 5h6M5.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {v.headsign}
                        </span>
                      )}
                    </div>

                    {/* Distance with mini progress bar */}
                    <div className="departure-dist">
                      <span className="departure-dist-val">{distStr}</span>
                      <div className="departure-dist-bar">
                        <div
                          className="departure-dist-fill"
                          style={{
                            width: `${Math.max(4, 100 - (v.distM / 5000) * 100)}%`,
                            background: getRouteColor(v.routeId),
                          }}
                        />
                      </div>
                    </div>

                    {/* ETA */}
                    <div className={`departure-eta ${etaClass}`}>
                      {v.eta == null ? (
                        <span className="eta-badge eta-stopped">Stopped</span>
                      ) : (
                        <span className={`eta-badge ${etaClass}`}>{etaStr}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StopInfoPanel;
