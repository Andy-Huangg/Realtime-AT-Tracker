# AT Live Bus Tracker

A real‑time Auckland Transport vehicle tracker built with a React + Vite frontend and a Node.js + Express backend. It parses GTFS static data to list routes (with headsigns and transport types), fetches GTFS‑Realtime feeds for vehicle positions, and renders an interactive Leaflet map with SVG icons.

## Features

- 📑 GTFS parser (`frontend/src/utils/routeutils.js`)  
  • `parseRoutes()` ingests `routes.txt` + `route_headsigns.json`, annotates each route with transport type and headsign.  
  • `getRouteColor(routeId)` generates a deterministic hex color per route.

- 🗺 Interactive map (`frontend/src/components/BusMap.jsx`)  
  • Fetches live positions from `/api/vehicles`, displays Leaflet markers with custom‐rotated SVG icons (`createVehicleIcon`).  
  • Polylines for selected route shapes from `/api/routes?routeIds=[…]`.

- 📋 Route selector (`frontend/src/components/RouteSelector.jsx`)  
  • Searchable, multi‑select list of routes with vehicle counts and headsigns.

- ⚙️ Backend services (`backend/services/atService.js`, `backend/services/routeService.js`)  
  • Polls AT GTFS‑Realtime feed every 30 s, decodes Protobuf, caches latest vehicle data.  
  • Parses GTFS shapes & trips to serve route geometries.

## Tech Stack

- Frontend: React, Vite, Leaflet, JavaScript, CSS
- Backend: Node.js, Express, Axios, gtfs‑realtime‑bindings
- Data: GTFS static (CSV, JSON), GTFS‑Realtime (Protobuf)
- Build & tooling: ESLint, npm scripts

## Getting Started

- Clone the repo:

  ```powershell
  git clone https://github.com/your-org/Realtime-AT-Tracker.git
  cd Realtime-AT-Tracker
  ```

- Setup Backend:

  ```powershell
  cd backend
  npm install
  # Create a .env file with:
  #   AT_API_KEY=<your AT API key>
  npm run dev      # or npm start
  ```

- Setup Frontend:
  ```powershell
  cd frontend
  npm install
  npm run dev      # starts Vite on http://localhost:5173
  ```

## API Endpoints

- **GET** `/api/vehicles`
  Returns latest vehicle positions and last update timestamp.

- **GET** `/api/routes?routeIds=[...]`
  Returns polyline shapes for one or more route IDs.
