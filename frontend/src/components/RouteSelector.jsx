import React, { useState, useRef, useEffect, useMemo } from "react";
import "./RouteSelector.css";

const RouteSelector = ({
  routes,
  selectedRouteIds,
  onRouteChange,
  vehicles = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Count vehicles for each route
  const vehiclesPerRoute = useMemo(() => {
    const counter = {};
    vehicles.forEach((vehicle) => {
      if (vehicle.routeId) {
        counter[vehicle.routeId] = (counter[vehicle.routeId] || 0) + 1;
      }
    });
    return counter;
  }, [vehicles]);

  // Filter routes based on search term
  const filteredRoutes = routes.filter(
    (route) =>
      route.route_short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.transport_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the selected routes objects for display
  const selectedRoutes = routes.filter((route) =>
    selectedRouteIds.includes(route.route_id)
  );

  const handleCheckboxChange = (routeId) => {
    if (selectedRouteIds.includes(routeId)) {
      onRouteChange(selectedRouteIds.filter((id) => id !== routeId));
    } else {
      onRouteChange([...selectedRouteIds, routeId]);
    }
  };

  const removeSelected = (routeId) => {
    onRouteChange(selectedRouteIds.filter((id) => id !== routeId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="route-selector-container" ref={dropdownRef}>
      <div className="route-selector-header" onClick={() => setIsOpen(!isOpen)}>
        <span>Select routes</span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="route-dropdown-container">
          <input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="route-search"
          />

          <div className="route-options-list">
            {filteredRoutes.map((route) => (
              <div key={route.route_id} className="route-option">
                <label>
                  <div className="route-option-label">
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedRouteIds.includes(route.route_id)}
                        onChange={() => handleCheckboxChange(route.route_id)}
                      />
                      <span
                        className={`transport-type ${route.transport_type.toLowerCase()}`}
                      >
                        {route.route_short_name}
                      </span>
                      <span className="transport-label">
                        ({route.transport_type})
                      </span>
                    </div>
                    <span className="vehicle-count">
                      {vehiclesPerRoute[route.route_id] || 0} vehicles
                    </span>
                  </div>
                </label>
              </div>
            ))}
            {filteredRoutes.length === 0 && (
              <div className="no-results">No routes found</div>
            )}
          </div>
        </div>
      )}

      {selectedRoutes.length > 0 && (
        <div className="selected-routes">
          {selectedRoutes.map((route) => (
            <div key={route.route_id} className="selected-route-tag">
              <span
                className={`transport-type ${route.transport_type.toLowerCase()}`}
              >
                {route.route_short_name}
              </span>
              <span className="selected-vehicle-count">
                ({vehiclesPerRoute[route.route_id] || 0})
              </span>
              <button
                className="remove-route"
                onClick={() => removeSelected(route.route_id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteSelector;
