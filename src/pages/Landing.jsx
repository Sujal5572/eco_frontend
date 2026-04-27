import { useState } from "react";

export default function Landing({ onEnter }) {
  const [name, setName] = useState("");

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f5"
    }}>
      <div style={{ width: "400px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
          EcoCab · Patna Pilot
        </h1>

        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Shared autos, smarter corridors.
        </h2>

        <p style={{ marginBottom: "20px", color: "#555" }}>
          No assignments, no surge pricing. Passengers signal demand.
        </p>

        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px"
          }}
        />

        <button
          onClick={() => onEnter({ role: "PASSENGER", name })}
          style={{
            width: "100%",
            padding: "10px",
            background: "black",
            color: "white",
            border: "none"
          }}
        >
          Continue as Passenger
        </button>

        <button
          onClick={() => onEnter({ role: "DRIVER", name })}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px"
          }}
        >
          Continue as Driver
        </button>
      </div>
    </div>
  );
}