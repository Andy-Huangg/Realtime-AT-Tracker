import React from "react";
import RouteSelector from "./RouteSelector";

const Dashboard = ({
  isLoading,
  error,
  vehicles,
  lastUpdate,
  routes,
  selectedRouteIds,
  onRouteChange,
}) => {
  return (
    <div className="status-overlay">
      <h3>Auckland Live Bus Tracker</h3>
      {isLoading && <p>Loading initial data...</p>}
      {error && <p className="error-message">Error: {error}</p>}
      {!isLoading && !error && (
        <>
          <p>
            Displaying {vehicles.length} / {vehicles.length} buses. Last update:{" "}
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
  );
};

export default Dashboard;
