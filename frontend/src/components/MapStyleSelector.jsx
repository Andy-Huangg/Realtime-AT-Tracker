import React, { useState, useRef, useEffect } from "react";
import { MAP_STYLES } from "../utils/mapStyles";
import "./MapStyleSelector.css";

const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 4.5L8 8L2 4.5L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    <path d="M2 8L8 11.5L14 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M2 11.5L8 15L14 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

const MapStyleSelector = ({ currentStyleId, onStyleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const current = MAP_STYLES[currentStyleId];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="map-style-selector" ref={ref}>
      {isOpen && (
        <div className="map-style-panel">
          <div className="map-style-panel-title">Map Style</div>
          <div className="map-style-grid">
            {Object.values(MAP_STYLES).map((style) => (
              <button
                key={style.id}
                className={`map-style-option ${currentStyleId === style.id ? "active" : ""}`}
                onClick={() => { onStyleChange(style.id); setIsOpen(false); }}
              >
                <div
                  className="map-style-swatch"
                  style={{ background: style.swatch }}
                >
                  {currentStyleId === style.id && (
                    <span className="map-style-check">✓</span>
                  )}
                </div>
                <span className="map-style-name">{style.name}</span>
                <span className="map-style-desc">{style.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="map-style-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change map style"
      >
        <LayersIcon />
        <span className="map-style-trigger-label">{current.name}</span>
        <span className="map-style-trigger-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
    </div>
  );
};

export default MapStyleSelector;
