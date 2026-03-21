import React, { useState, useRef, useEffect, useMemo } from "react";
import "./RouteSelector.css";
import { getRouteColor } from "../utils/routeUtils";

const RouteSelector = ({
  routes,
  selectedRouteIds,
  onRouteChange,
  vehicles = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const vehiclesPerRoute = useMemo(() => {
    const counter = {};
    vehicles.forEach((v) => {
      if (v.routeId) counter[v.routeId] = (counter[v.routeId] || 0) + 1;
    });
    return counter;
  }, [vehicles]);

  const filteredRoutes = useMemo(() =>
    routes.filter(
      (r) =>
        r.route_short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transport_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.headsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(r.directions || {}).some((d) =>
          d.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ),
    [routes, searchTerm]
  );

  const selectedRoutes = routes.filter((r) => selectedRouteIds.includes(r.route_id));

  const handleCheckboxChange = (routeId) => {
    if (selectedRouteIds.includes(routeId)) {
      onRouteChange(selectedRouteIds.filter((id) => id !== routeId));
    } else {
      onRouteChange([...selectedRouteIds, routeId]);
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredRoutes.map((r) => r.route_id);
    const merged = [...new Set([...selectedRouteIds, ...filteredIds])];
    onRouteChange(merged);
  };

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredRoutes.map((r) => r.route_id));
    onRouteChange(selectedRouteIds.filter((id) => !filteredIds.has(id)));
  };

  const allFilteredSelected =
    filteredRoutes.length > 0 &&
    filteredRoutes.every((r) => selectedRouteIds.includes(r.route_id));

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="route-selector-container" ref={dropdownRef}>
      <div className="route-selector-header" onClick={() => setIsOpen(!isOpen)}>
        <span>
          {selectedRouteIds.length > 0
            ? `${selectedRouteIds.length} route${selectedRouteIds.length !== 1 ? "s" : ""} selected`
            : "Select routes"}
        </span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="route-dropdown-container">
          <div className="route-dropdown-toolbar">
            <input
              type="text"
              placeholder="Search routes…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="route-search"
            />
            <div className="route-bulk-actions">
              <button
                className="bulk-btn"
                onClick={handleSelectAll}
                disabled={allFilteredSelected}
                title={searchTerm ? "Select all matching" : "Select all"}
              >
                Select all{searchTerm ? " matching" : ""}
              </button>
              <button
                className="bulk-btn bulk-btn-clear"
                onClick={handleDeselectAll}
                disabled={filteredRoutes.every((r) => !selectedRouteIds.includes(r.route_id))}
                title={searchTerm ? "Deselect matching" : "Deselect all"}
              >
                {searchTerm ? "Deselect matching" : "Deselect all"}
              </button>
            </div>
          </div>

          <div className="route-options-list">
            {filteredRoutes.map((route) => (
              <div key={route.route_id} className="route-option">
                <label className="route-option-inner">
                  <input
                    type="checkbox"
                    checked={selectedRouteIds.includes(route.route_id)}
                    onChange={() => handleCheckboxChange(route.route_id)}
                  />
                  <div className="route-option-body">
                    <div className="route-option-top">
                      <span
                        className="transport-type"
                        style={{ backgroundColor: getRouteColor(route.route_id) }}
                      >
                        {route.route_short_name}
                      </span>
                      <span className="transport-label">({route.transport_type})</span>
                      <span className="vehicle-count">
                        {vehiclesPerRoute[route.route_id] || 0} vehicle
                        {vehiclesPerRoute[route.route_id] !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="route-directions">
                      {route.directions?.["0"] && (
                        <span className="route-dir">
                          <span className="route-dir-arrow">→</span>
                          {route.directions["0"]}
                        </span>
                      )}
                      {route.directions?.["1"] && (
                        <span className="route-dir">
                          <span className="route-dir-arrow">←</span>
                          {route.directions["1"]}
                        </span>
                      )}
                    </div>
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

      {selectedRoutes.length > 0 && !isOpen && (
        <div>
          <div className="selected-routes-header-row">
            <h3 className="selected-routes-header">Selected Routes</h3>
            <button
              className="deselect-all-btn"
              onClick={() => onRouteChange([])}
            >
              Clear all
            </button>
          </div>
          <div className="selected-routes">
            {selectedRoutes.map((route) => (
              <div key={route.route_id} className="selected-route-tag">
                <div className="selected-route-top">
                  <div className="selected-route-information">
                    <div className="selected-route-information-left">
                      <span
                        className="transport-type"
                        style={{ backgroundColor: getRouteColor(route.route_id) }}
                      >
                        {route.route_short_name}
                      </span>
                      <span className="transport-label">({route.transport_type})</span>
                    </div>
                    <span className="selected-vehicle-count">
                      {vehiclesPerRoute[route.route_id] || 0} vehicle
                      {vehiclesPerRoute[route.route_id] !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="selected-route-directions">
                    {route.directions?.["0"] && (
                      <span className="route-dir small">
                        <span className="route-dir-arrow">→</span>
                        {route.directions["0"]}
                      </span>
                    )}
                    {route.directions?.["1"] && (
                      <span className="route-dir small">
                        <span className="route-dir-arrow">←</span>
                        {route.directions["1"]}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="remove-route"
                  onClick={() => onRouteChange(selectedRouteIds.filter((id) => id !== route.route_id))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteSelector;
