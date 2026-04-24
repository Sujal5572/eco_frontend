import { useState } from "react";
import Landing from "./pages/Landing";
import PassengerView from "./pages/PassengerView";
import DriverView from "./pages/DriverView";
import OpsDashboard from "./pages/OpsDashboard";

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <Landing onEnter={setSession} />;
  }

  const demoUser = { id: "demo-user-001", name: session.name };

  if (session.role === "PASSENGER") {
    return <PassengerView user={demoUser} />;
  }

  if (session.role === "DRIVER") {
    return <DriverView user={demoUser} />;
  }

  return <OpsDashboard />;
}