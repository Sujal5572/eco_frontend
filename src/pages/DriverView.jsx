import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import SegmentHeatmap from "../components/heatmap/SegmentHeatmap";
import HeatmapNodes from "../components/heatmap/HeatmapNodes";
import GuidanceBanner from "../components/common/GuidanceBanner";

export default function DriverView({ user }) {
  const [driver, setDriver] = useState(null);
  const [corridors, setCorridors] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [trip, setTrip] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [selCorridor, setSelCorridor] = useState(null);

  const pingRef = useRef(null);

  useEffect(() => {
    api("GET", "/corridors")
      .then(setCorridors)
      .catch(() =>
        setCorridors([
          { id: "c1", name: "GG → GM", code: "GG_GM", totalSegments: 8 },
        ])
      );
  }, []);

  const register = async () => {
    try {
      const d = await api("POST", "/drivers/register", {
        name: user.name,
      });
      setDriver(d);
    } catch {
      setDriver({ id: "demo-driver" });
    }
  };

  const goOnline = async () => {
    if (!selCorridor) return;

    try {
      await api("PATCH", `/drivers/${driver.id}/status`, {
        status: "ONLINE",
        corridorId: selCorridor.id,
      });
    } catch {}

    setIsOnline(true);
    pingRef.current = setInterval(pingLocation, 10000);
  };

  const goOffline = () => {
    clearInterval(pingRef.current);
    setIsOnline(false);
  };

  const pingLocation = async () => {
    try {
      const resp = await api("PUT", `/drivers/${driver.id}/location`, {
        latitude: 25.6,
        longitude: 85.1,
      });
      setGuidance(resp);
    } catch {
      setGuidance({
        guidance: "CONTINUE",
        guidanceReason: "Maintain pace",
        urgency: "LOW",
      });
    }
  };

  useEffect(() => {
    return () => clearInterval(pingRef.current);
  }, []);

  if (!driver) {
    return (
      <div>
        <h2>Register Driver</h2>
        <button onClick={register}>Register</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Driver Dashboard</h2>

      {!isOnline ? (
        <>
          <select onChange={(e) =>
            setSelCorridor(corridors.find(c => c.id === e.target.value))
          }>
            <option>Select corridor</option>
            {corridors.map(c => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>

          <button onClick={goOnline}>Go Online</button>
        </>
      ) : (
        <>
          <button onClick={goOffline}>Go Offline</button>

          {guidance && (
            <GuidanceBanner
              guidance={guidance.guidance}
              reason={guidance.guidanceReason}
              urgency={guidance.urgency}
            />
          )}

          {heatmap && (
            <>
              <HeatmapNodes segments={heatmap.segments} />
              <SegmentHeatmap segments={heatmap.segments} />
            </>
          )}
        </>
      )}
    </div>
  );
}