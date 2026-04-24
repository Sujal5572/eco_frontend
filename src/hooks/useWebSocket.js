import { useEffect, useRef } from "react";
import { WS } from "../config/constants";

export default function useWebSocket(driverId, corridorCode, onMessage) {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!driverId || !corridorCode) return;

    const url = `${WS}/ws/driver/${driverId}?corridor=${corridorCode}`;
    const ws = new WebSocket(url);

    ws.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {}
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [driverId, corridorCode]);
}