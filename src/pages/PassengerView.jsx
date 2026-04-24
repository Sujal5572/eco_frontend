import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function PassengerView({ user }) {
  const [corridors, setCorridors] = useState([]);

  useEffect(() => {
    api("GET", "/corridors").then(setCorridors);
  }, []);

  return (
    <div>
      <h2>Passenger View</h2>
      {corridors.map(c => (
        <div key={c.id}>{c.name}</div>
      ))}
    </div>
  );
}