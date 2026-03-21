export const MAP_STYLES = {
  voyage: {
    id: "voyage",
    name: "Voyage",
    description: "Colourful & detailed",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    swatch: "linear-gradient(135deg, #f0e8d8 30%, #c8d8b8 55%, #a8b898 80%, #d4c4a0 100%)",
  },
  atlas: {
    id: "atlas",
    name: "Atlas",
    description: "Clean & minimal",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    swatch: "linear-gradient(135deg, #f8f8f8 40%, #ececec 65%, #e0e0e0 100%)",
  },
  street: {
    id: "street",
    name: "Street",
    description: "Classic OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    swatch: "linear-gradient(135deg, #fdf6e3 35%, #f0d9b5 60%, #d4b896 85%, #b8a88a 100%)",
  },
  terrain: {
    id: "terrain",
    name: "Terrain",
    description: "Topographic",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    swatch: "linear-gradient(135deg, #c8d8a0 25%, #88a860 50%, #708860 70%, #585848 90%)",
  },
  night: {
    id: "night",
    name: "Night",
    description: "Dark mode",
    url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    swatch: "linear-gradient(135deg, #1a2035 30%, #252c45 55%, #1e253e 75%, #141a2e 100%)",
  },
};

export const DEFAULT_STYLE_ID = "voyage";
