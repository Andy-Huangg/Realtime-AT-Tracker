import routesData from "../assets/gtfsdata/routes.txt?raw";
import L from "leaflet";
const getTransportType = (routeType) => {
  switch (routeType) {
    case "0":
      return "TRAM";
    case "1":
      return "SUBWAY";
    case "2":
      return "TRAIN";
    case "3":
      return "BUS";
    case "4":
      return "FERRY";
    default:
      return "UNKNOWN";
  }
};

export const parseRoutes = () => {
  return routesData
    .split("\n")
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const columns = line.split(",");
      const [route_id, , route_short_name, , , route_type] = columns;
      return {
        route_id,
        route_short_name,
        transport_type: getTransportType(route_type),
      };
    })
    .filter((route) => route.route_id && route.route_short_name);
};

// Generates a random color for each route
export const getRouteColor = (routeId) => {
  // Generate a deterministic color based on the routeId
  const hash = routeId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export const createVehicleIcon = (color, rotationAngle = 0) => {
  const directionPath =
    "M 6.103 18.641 C 0.406 13.479 7.584 4.37 7.584 4.37 L 11.027 0.965 L 14.278 4.216 C 14.31 4.111 21.84 13.19 16.991 18.476 C 12.142 23.762 6.18 18.943 6.103 18.641 Z"; // Original direction path (24x24 viewBox)
  const busPath =
    "M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z"; // Original bus path (24x24 viewBox)

  const iconWidth = 50;
  const iconHeight = 50;
  const busSize = 25;
  const busX = (iconWidth - busSize) / 2;
  const busY = (iconHeight - busSize) / 2;

  const directionScale = 1.5;
  const directionOriginX = 12;
  const directionOriginY = 13;
  const directionOffsetX = iconWidth / 2;
  const directionOffsetY = iconHeight / 2;

  const directionTransform = `translate(${directionOffsetX}, ${directionOffsetY}) rotate(${rotationAngle}) scale(${directionScale}) translate(-${directionOriginX}, -${directionOriginY})`;

  const busTransform = `translate(${busX}, ${busY}) scale(${busSize / 24})`;

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconWidth}" height="${iconHeight}" viewBox="0 0 ${iconWidth} ${iconHeight}">
      <!-- Rotated Direction Pointer (Background) -->
      <g transform="${directionTransform}">
         <path fill="${color}" d="${directionPath}" stroke="black" stroke-width="0.5"/>
      </g>
      <!-- Bus Icon (Foreground) -->
      <g transform="${busTransform}">
         <path fill="white" d="${busPath}" stroke="black" stroke-width="0.5" />
      </g>
    </svg>
  `;

  return new L.divIcon({
    html: svgString,
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconWidth / 2, iconHeight / 2],
    popupAnchor: [0, -iconHeight / 2],
    className: "",
  });
};
