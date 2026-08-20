# TruckIQ Fleet Monitor

A real-time truck fleet tracking dashboard: live GPS positions on an interactive map, instant updates over WebSockets, and a REST API backing it all.

**Stack**
- Frontend: React (Vite) + Leaflet + Socket.IO client
- Backend: Node.js + Express + Socket.IO
- Database: MongoDB Atlas (Mongoose)

## Project structure

```
truckiq-fleet-monitor/
├── server/                  Express + Socket.IO API
│   ├── src/
│   │   ├── config/db.js         MongoDB Atlas connection
│   │   ├── models/               Vehicle, LocationHistory schemas
│   │   ├── controllers/          REST handlers
│   │   ├── routes/               /api/vehicles routes
│   │   ├── sockets/               Socket.IO event handling + offline watcher
│   │   ├── middleware/            validation + centralized error handling
│   │   ├── utils/seed.js          seeds 3 demo trucks
│   │   ├── utils/simulate.js      emits fake GPS pings for a live demo
│   │   ├── app.js                 Express app (middleware + routes)
│   │   └── server.js              HTTP + Socket.IO bootstrap
│   ├── .env.example
│   └── package.json
└── client/                  React (Vite) dashboard
    ├── src/
    │   ├── components/            TopBar, VehicleList, MapView, StatusChip
    │   ├── hooks/useFleetSocket.js  REST snapshot + live socket sync
    │   ├── services/               api.js (axios), socket.js (socket.io-client)
    │   ├── styles/index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine) with a connection string, **or** a local `mongod` instance

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` to your Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/truckiq?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
```

Seed a few demo trucks, then start the API:

```bash
npm run seed
npm run dev
```

The API listens on `http://localhost:5000`. Health check: `GET /api/health`.

Optional — simulate live GPS movement for the seeded trucks (run in a second terminal):

```bash
npm run simulate
```

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. You should see the seeded trucks on the map, and — if `npm run simulate` is running — watch them move in real time.

## REST API reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/vehicles` | List all vehicles (`?status=active` to filter) |
| GET | `/api/vehicles/:vehicleId` | Get one vehicle |
| POST | `/api/vehicles` | Register a vehicle `{ vehicleId, name, driverName?, plateNumber? }` |
| PATCH | `/api/vehicles/:vehicleId` | Update `name` / `driverName` / `plateNumber` / `status` |
| DELETE | `/api/vehicles/:vehicleId` | Remove a vehicle and its history |
| POST | `/api/vehicles/:vehicleId/location` | REST fallback to push a GPS fix `{ lat, lng, speedKmh?, heading? }` |
| GET | `/api/vehicles/:vehicleId/history` | Location trail (`?limit=200&from=&to=`) |

## Socket.IO events

**Client → Server**
- `location:update` — `{ vehicleId, lat, lng, speedKmh?, heading? }`. Accepts an ack callback with `{ success, data | message }`.

**Server → Client**
- `vehicle:update` — full vehicle document, broadcast whenever any vehicle's state changes (via socket or REST).
- `vehicle:offline` — `{ vehicleId }`, emitted when a truck hasn't reported in over `OFFLINE_THRESHOLD_MS` (default 60s).
- `error` — `{ message }`, sent back to the socket that triggered a failed update.

## Notes on what was fixed / hardened in this rebuild

- Centralized error handling (`middleware/errorHandler.js`) instead of ad hoc try/catch scattered across routes.
- Request validation on both vehicle creation and location ingestion (`express-validator`), so bad payloads return a clear 400 instead of crashing the process or silently corrupting data.
- A single source of truth for real-time state: REST is used only for the initial snapshot and history queries; all live updates flow through Socket.IO and update both the `Vehicle` document (current state) and `LocationHistory` (trail) atomically.
- An offline watcher marks trucks "offline" if they stop reporting, instead of leaving stale "active" markers on the map forever.
- CORS and Socket.IO origins are both driven from one `CLIENT_ORIGIN` env var so frontend/backend can't drift out of sync.
- Frontend keeps a single shared socket instance (`services/socket.js`) instead of reconnecting per component, and normalizes API errors so the UI can surface them directly.
- Leaflet's default marker asset paths (a common Vite + Leaflet breakage) are replaced with inline SVG divIcons colored by vehicle status, so markers render correctly without broken image requests.
