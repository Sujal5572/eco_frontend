import { useState } from 'react';
import Landing from './pages/Landing';
import PassengerView from './pages/PassengerView';
import DriverView from './pages/DriverView';
import OpsDashboard from './pages/OpsDashboard';

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) return <Landing onEnter={setSession} />;

  const user = { id: '699b5edb-7348-4554-89a9-37c3382e793e', name: session.name };

  if (session.role === 'PASSENGER') return <PassengerView user={user} />;
  if (session.role === 'DRIVER')    return <DriverView    user={user} />;
  return <OpsDashboard />;
}