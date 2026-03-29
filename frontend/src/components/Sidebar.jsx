import React, { useState, useMemo } from "react";
import RouteSelector from "./RouteSelector";
import RouteStatsPanel, { ConnectionDot } from "./RouteStatsPanel";
import StopInfoPanel from "./StopInfoPanel";
import "./Sidebar.css";

const Sidebar = ({
  vehicles,
  filteredVehicles,
  lastUpdate,
  connectionStatus,
  routes,
  selectedRouteIds,
  onRouteChange,
  selectedStop,
  onStopSelect,
  routeStops,
  stopsVisible,
  onStopsVisibleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("routes");

  // Fleet breakdown by type for Info tab
  const fleetBreakdown = useMemo(() => {
    const counts = { BUS: 0, TRAIN: 0, FERRY: 0, OTHER: 0 };
    vehicles.forEach((v) => {
      const route = routes.find((r) => r.route_id === v.routeId);
      const type = route?.transport_type || "OTHER";
      if (type in counts) counts[type]++;
      else counts.OTHER++;
    });
    return counts;
  }, [vehicles, routes]);

  const TABS = [
    { id: "routes", label: "Routes" },
    { id: "info", label: "Info" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <>
      {!isOpen && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <rect width="18" height="2" rx="1" fill="currentColor" />
            <rect y="6" width="12" height="2" rx="1" fill="currentColor" />
            <rect y="12" width="18" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      )}

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">
              <span>AT</span>
            </div>
            <div className="sidebar-brand-text">
              <h1 className="sidebar-title">Live Tracker</h1>
              <p className="sidebar-subtitle">Auckland Transport</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setIsOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="sidebar-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {activeTab === "routes" && (
            <RouteSelector
              routes={routes}
              selectedRouteIds={selectedRouteIds}
              onRouteChange={onRouteChange}
              vehicles={vehicles}
            />
          )}

          {activeTab === "info" && (
            <div className="info-tab">
              {/* Connection status */}
              <div className={`info-connection ${connectionStatus}`}>
                <div className="info-connection-left">
                  <ConnectionDot status={connectionStatus} />
                  <div>
                    <div className="info-connection-status">
                      {connectionStatus === "connected"
                        ? "Live feed active"
                        : connectionStatus === "disconnected"
                          ? "Disconnected"
                          : connectionStatus === "error"
                            ? "Connection error"
                            : "Connecting…"}
                    </div>
                    {lastUpdate && (
                      <div className="info-connection-time">
                        Last update: {new Date(lastUpdate).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fleet overview */}
              <div className="info-section">
                <div className="info-section-title">Fleet Overview</div>
                <div className="fleet-grid">
                  <div className="fleet-item">
                    <span className="fleet-icon">🚌</span>
                    <span className="fleet-count">{fleetBreakdown.BUS}</span>
                    <span className="fleet-label">Buses</span>
                  </div>
                  <div className="fleet-item">
                    <span className="fleet-icon">🚂</span>
                    <span className="fleet-count">{fleetBreakdown.TRAIN}</span>
                    <span className="fleet-label">Trains</span>
                  </div>
                  <div className="fleet-item">
                    <span className="fleet-icon">⛴</span>
                    <span className="fleet-count">{fleetBreakdown.FERRY}</span>
                    <span className="fleet-label">Ferries</span>
                  </div>
                </div>
              </div>

              {/* Selection summary */}
              <div className="info-section">
                <div className="info-section-title">Current Selection</div>
                <div className="info-summary-rows">
                  <div className="info-summary-row">
                    <span className="info-summary-label">Routes selected</span>
                    <span className="info-summary-value">
                      {selectedRouteIds.length}
                    </span>
                  </div>
                  <div className="info-summary-row">
                    <span className="info-summary-label">Vehicles on map</span>
                    <span className="info-summary-value accent">
                      {filteredVehicles.length}
                    </span>
                  </div>
                  <div className="info-summary-row">
                    <span className="info-summary-label">Total vehicles</span>
                    <span className="info-summary-value">
                      {vehicles.length}
                    </span>
                  </div>
                  <div className="info-summary-row">
                    <span className="info-summary-label">Stops loaded</span>
                    <span className="info-summary-value">
                      {Object.values(routeStops).reduce(
                        (s, arr) => s + (arr?.length || 0),
                        0,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stops visibility toggle */}
              <div className="info-section">
                <div className="info-section-title">Map Layers</div>
                <button
                  className={`stops-sidebar-toggle ${stopsVisible ? "active" : ""}`}
                  onClick={() => onStopsVisibleChange((v) => !v)}
                >
                  <span className="stops-sidebar-toggle-dot" />
                  <span className="stops-sidebar-toggle-label">
                    Stop markers
                  </span>
                  <span className="stops-sidebar-toggle-state">
                    {stopsVisible ? "Visible" : "Hidden"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <RouteStatsPanel
              filteredVehicles={filteredVehicles}
              routes={routes}
              selectedRouteIds={selectedRouteIds}
              lastUpdate={lastUpdate}
              connectionStatus={connectionStatus}
            />
          )}
        </div>
      </div>

      <StopInfoPanel
        selectedStop={selectedStop}
        routeStops={routeStops}
        filteredVehicles={filteredVehicles}
        onClose={() => onStopSelect(null)}
      />

      {isOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
