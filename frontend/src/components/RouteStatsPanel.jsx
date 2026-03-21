import React, { useMemo, useState, useEffect } from "react";
import { getRouteColor } from "../utils/routeUtils";
import "./RouteStatsPanel.css";

const ConnectionDot = ({ status }) => {
  const cls =
    status === "connected" ? "dot-connected" :
    status === "error"     ? "dot-error"     : "dot-disconnected";
  return <span className={`connection-dot ${cls}`} />;
};

const SpeedBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="speed-bar-track">
      <div className="speed-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

const RouteStatsPanel = ({
  filteredVehicles,
  routes,
  selectedRouteIds,
  lastUpdate,
  connectionStatus,
}) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const tick = () => {
      if (lastUpdate) setSecondsAgo(Math.floor((Date.now() - new Date(lastUpdate)) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdate]);

  const ageColor =
    secondsAgo < 35 ? "var(--success)" :
    secondsAgo < 60 ? "var(--warning)" : "var(--error)";

  const globalMaxSpeed = useMemo(() => {
    const speeds = filteredVehicles.map((v) => v.speed || 0);
    return speeds.length > 0 ? Math.max(...speeds) : 100;
  }, [filteredVehicles]);

  const statsPerRoute = useMemo(() => {
    return selectedRouteIds.map((routeId) => {
      const rv = filteredVehicles.filter((v) => v.routeId === routeId);
      const route = routes.find((r) => r.route_id === routeId);
      const withSpeed = rv.filter((v) => v.speed != null);
      const moving = rv.filter((v) => v.speed != null && v.speed > 0);
      const stopped = rv.filter((v) => v.speed == null || v.speed === 0);
      const avgSpeed = withSpeed.length > 0
        ? withSpeed.reduce((s, v) => s + v.speed, 0) / withSpeed.length : 0;
      const maxSpeed = withSpeed.length > 0
        ? Math.max(...withSpeed.map((v) => v.speed)) : 0;
      return {
        routeId,
        shortName: route?.route_short_name || routeId,
        transportType: route?.transport_type || "BUS",
        headsign: route?.headsign || "",
        vehicleCount: rv.length,
        movingCount: moving.length,
        stoppedCount: stopped.length,
        avgSpeed,
        maxSpeed,
        activityPct: rv.length > 0 ? (moving.length / rv.length) * 100 : 0,
      };
    });
  }, [filteredVehicles, routes, selectedRouteIds]);

  if (selectedRouteIds.length === 0) {
    return (
      <div className="stats-empty">
        <div className="stats-empty-icon">📡</div>
        <p>Select routes to view live statistics</p>
      </div>
    );
  }

  return (
    <div className="route-stats-panel">
      {/* Live indicator */}
      <div className="stats-live-bar">
        <div className="stats-live-left">
          <ConnectionDot status={connectionStatus} />
          <span className="stats-live-label">
            {connectionStatus === "connected" ? "Live" : connectionStatus}
          </span>
        </div>
        {lastUpdate && (
          <span className="stats-age" style={{ color: ageColor }}>
            Updated {secondsAgo}s ago
          </span>
        )}
      </div>

      <div className="stats-cards">
        {statsPerRoute.map((s) => {
          const color = getRouteColor(s.routeId);
          return (
            <div key={s.routeId} className="stats-card">
              {/* Card header */}
              <div className="stats-card-header">
                <div className="stats-card-left">
                  <span className="stats-route-badge" style={{ background: color }}>
                    {s.shortName}
                  </span>
                  <div className="stats-route-info">
                    <span className="stats-transport-type">{s.transportType}</span>
                    {s.headsign && <span className="stats-headsign">→ {s.headsign}</span>}
                  </div>
                </div>
                <div className="stats-count-block">
                  <span className="stats-count-num">{s.vehicleCount}</span>
                  <span className="stats-count-label">vehicles</span>
                </div>
              </div>

              {/* Moving / Stopped */}
              <div className="stats-motion-row">
                <div className="stats-motion-item moving">
                  <span className="stats-motion-dot" />
                  <span className="stats-motion-val">{s.movingCount}</span>
                  <span className="stats-motion-label">moving</span>
                </div>
                <div className="stats-motion-divider" />
                <div className="stats-motion-item stopped">
                  <span className="stats-motion-dot" />
                  <span className="stats-motion-val">{s.stoppedCount}</span>
                  <span className="stats-motion-label">stopped</span>
                </div>
                <div className="stats-activity-pct" style={{ color }}>
                  {s.activityPct.toFixed(0)}% active
                </div>
              </div>

              {/* Speed metrics */}
              <div className="stats-speed-block">
                <div className="stats-speed-row">
                  <span className="stats-speed-label">Avg speed</span>
                  <div className="stats-speed-right">
                    <SpeedBar value={s.avgSpeed} max={globalMaxSpeed} color={color} />
                    <span className="stats-speed-val">{s.avgSpeed.toFixed(1)}</span>
                    <span className="stats-speed-unit">km/h</span>
                  </div>
                </div>
                <div className="stats-speed-row">
                  <span className="stats-speed-label">Max speed</span>
                  <div className="stats-speed-right">
                    <SpeedBar value={s.maxSpeed} max={globalMaxSpeed} color={color} />
                    <span className="stats-speed-val">{s.maxSpeed.toFixed(1)}</span>
                    <span className="stats-speed-unit">km/h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { ConnectionDot };
export default RouteStatsPanel;
