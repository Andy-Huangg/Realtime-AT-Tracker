import routesData from "../assets/gtfsdata/routes.txt?raw";

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
