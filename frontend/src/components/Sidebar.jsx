import React, { useState } from "react";
import RouteSelector from "./RouteSelector";
import "./Sidebar.css";

const Sidebar = ({
  isLoading,
  error,
  vehicles,
  lastUpdate,
  routes,
  selectedRouteIds,
  onRouteChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
        </button>
        <h3>Auckland Live Bus Tracker</h3>
        {isLoading && <p>Loading initial data...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && (
          <>
            <p>
              Displaying {vehicles.length} buses. Last update:{" "}
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "N/A"}
            </p>
            <div className="route-selection">
              <RouteSelector
                routes={routes}
                selectedRouteIds={selectedRouteIds}
                onRouteChange={onRouteChange}
              />
            </div>
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
