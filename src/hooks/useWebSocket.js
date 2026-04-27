import { useEffect, useRef, useCallback } from 'react';
import { WS_BASE } from '../config/constants';

export default function useWebSocket(driverId, corridorCode, onMessage) {
  const wsRef     = useRef(null);
  const timerRef  = useRef(null);
  const activeRef = useRef(false);

  const connect = useCallback(() => {
    if (!driverId || !corridorCode) return;
    const url = `${WS_BASE}/ws/driver/${driverId}?corridor=${corridorCode}`;
    const ws  = new WebSocket(url);

    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch {} };
    ws.onclose   = () => { if (!activeRef.current) timerRef.current = setTimeout(connect, 3000); };
    ws.onerror   = () => ws.close();
    wsRef.current = ws;
  }, [driverId, corridorCode, onMessage]);

  useEffect(() => {
    activeRef.current = false;
    connect();
    return () => {
      activeRef.current = true;
      clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}