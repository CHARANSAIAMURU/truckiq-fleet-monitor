import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "../services/socket";
import { vehicleApi } from "../services/api";

/**
 * Owns the fleet's live state: loads the initial snapshot over REST, then
 * keeps it in sync via Socket.IO "vehicle:update" events. Exposes
 * connection status so the UI can show "reconnecting" if the socket drops.
 */
export default function useFleetSocket() {
  const [vehicles, setVehicles] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;

  const upsertVehicle = useCallback((incoming) => {
    setVehicles((prev) => {
      const idx = prev.findIndex((v) => v.vehicleId === incoming.vehicleId);
      if (idx === -1) return [...prev, incoming];
      const next = [...prev];
      next[idx] = incoming;
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await vehicleApi.getAll();
        if (mounted) setVehicles(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const socket = getSocket();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleVehicleUpdate = (vehicle) => upsertVehicle(vehicle);
    const handleSocketError = (payload) => {
      console.warn("[socket] server error:", payload?.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("vehicle:update", handleVehicleUpdate);
    socket.on("error", handleSocketError);

    setConnected(socket.connected);

    return () => {
      mounted = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("vehicle:update", handleVehicleUpdate);
      socket.off("error", handleSocketError);
    };
  }, [upsertVehicle]);

  return { vehicles, connected, loading, error };
}
