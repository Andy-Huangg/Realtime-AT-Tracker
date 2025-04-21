import React, { useState } from "react";
import RouteSelector from "./RouteSelector";
import "./Sidebar.css";

const Sidebar = ({
  isLoading,
  error,
  vehicles,
  filteredVehicles,
  lastUpdate,
  routes,
  selectedRouteIds,
  onRouteChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("routes"); // New state for tracking active tab

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen ? null : (
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      )}

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <button
          className="sidebar-toggle-inside "
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          x
        </button>{" "}
        <h3>Auckland Live Bus Tracker</h3>
        {isLoading && <p>Loading initial data...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && (
          <>
            <div className="sidebar-tabs">
              <button
                className={`tab-button ${
                  activeTab === "routes" ? "active" : ""
                }`}
                onClick={() => setActiveTab("routes")}
              >
                Routes
              </button>
              <button
                className={`tab-button ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                Info
              </button>
            </div>

            {activeTab === "info" && (
              <div className="info-tab">
                <p>
                  Displaying {filteredVehicles.length} buses. Last update:{" "}
                  {lastUpdate
                    ? new Date(lastUpdate).toLocaleTimeString()
                    : "N/A"}
                </p>
              </div>
            )}

            {activeTab === "routes" && (
              <div className="routes-tab">
                <div className="route-selection">
                  <RouteSelector
                    routes={routes}
                    selectedRouteIds={selectedRouteIds}
                    onRouteChange={onRouteChange}
                    vehicles={vehicles}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isOpen && (
        <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
