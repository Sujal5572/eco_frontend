import { useState } from "react";

export default function Landing({ onEnter }) {
  const [name, setName] = useState("");

  return (
    <div>
      <h1>EcoCab</h1>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => onEnter({ role: "PASSENGER", name })}>
        Enter
      </button>
    </div>
  );
}