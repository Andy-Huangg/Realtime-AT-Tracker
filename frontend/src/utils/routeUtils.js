import routesData from "../assets/gtfsdata/routes.txt?raw";
import routeHeadsigns from "../assets/gtfsdata/route_headsigns.json";
import routeDirections from "../assets/gtfsdata/route_directions.json";
import L from "leaflet";

const getTransportType = (routeType) => {
  switch (routeType) {
    case "0": return "TRAM";
    case "1": return "SUBWAY";
    case "2": return "TRAIN";
    case "3": return "BUS";
    case "4": return "FERRY";
    default:  return "UNKNOWN";
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
        headsign: routeHeadsigns[route_id] || "",
        directions: routeDirections[route_id] || {},
      };
    })
    .filter((route) => route.route_id && route.route_short_name);
};

export const getRouteColor = (routeId) => {
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

export const createVehicleIcon = (
  color,
  rotationAngle = 0,
  vehicleType = "BUS"
) => {
  const directionPath =
    "M 6.103 18.641 C 0.406 13.479 7.584 4.37 7.584 4.37 L 11.027 0.965 L 14.278 4.216 C 14.31 4.111 21.84 13.19 16.991 18.476 C 12.142 23.762 6.18 18.943 6.103 18.641 Z";
  const busPath =
    "M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z";
  const trainPath =
    "M12,2C8,2 4,2.5 4,6V15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H8.23L10.23,19H14L16,21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V6C20,2.5 16.42,2 12,2M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M11,10H6V6H11V10M13,10V6H18V10H13M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17Z";
  const ferryPath =
    "M6,6H18V9.96L12,8L6,9.96M3.94,19H4C5.6,19 7,18.12 8,17C9,18.12 10.4,19 12,19C13.6,19 15,18.12 16,17C17,18.12 18.4,19 20,19H20.05L21.95,12.31C22.03,12.06 22,11.78 21.89,11.54C21.76,11.3 21.55,11.12 21.29,11.04L20,10.62V6C20,4.89 19.1,4 18,4H15V1H9V4H6A2,2 0 0,0 4,6V10.62L2.71,11.04C2.45,11.12 2.24,11.3 2.11,11.54C2,11.78 1.97,12.06 2.05,12.31M20,21C18.61,21 17.22,20.53 16,19.67C13.56,21.38 10.44,21.38 8,19.67C6.78,20.53 5.39,21 4,21H2V23H4C5.37,23 6.74,22.65 8,22C10.5,23.3 13.5,23.3 16,22C17.26,22.65 18.62,23 20,23H22V21H20Z";

  let vehiclePath;
  switch (vehicleType?.toUpperCase()) {
    case "TRAIN":  vehiclePath = trainPath; break;
    case "FERRY":  vehiclePath = ferryPath; break;
    case "BUS":
    default:       vehiclePath = busPath;   break;
  }

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
      <g transform="${directionTransform}">
         <path fill="${color}" d="${directionPath}" stroke="rgba(0,0,0,0.6)" stroke-width="0.5"/>
      </g>
      <g transform="${busTransform}">
         <path fill="white" d="${vehiclePath}" stroke="rgba(0,0,0,0.4)" stroke-width="0.5" />
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

export const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  return new L.divIcon({
    html: `<div class="cluster-icon"><span>${count}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: "",
  });
};

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
