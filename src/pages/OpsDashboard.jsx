import { useState, useEffect } from "react";
import SegmentHeatmap from "../components/heatmap/SegmentHeatmap";
import DensityPill from "../components/common/DensityPill";

export default function OpsDashboard() {
  const [corridors, setCorridors] = useState([]);
  const [selected, setSelected] = useState(null);

  const demoCorridors = [
    {
      id: "c1",
      code: "GG_GM",
      name: "Gai Ghat → Gandhi Maidan",
      segments: [
        { segmentIndex: 0, demandCount: 2, driverCount: 3, densityLevel: "LOW" },
        { segmentIndex: 1, demandCount: 14, driverCount: 1, densityLevel: "SURGE" },
      ],
    },
  ];

  useEffect(() => {
    setCorridors(demoCorridors);
    setSelected(demoCorridors[0]);
  }, []);

  return (
    <div>
      <h2>Operations Dashboard</h2>

      {corridors.map(c => (
        <div key={c.id} onClick={() => setSelected(c)}>
          <h4>{c.code}</h4>
          <SegmentHeatmap segments={c.segments} />
        </div>
      ))}

      {selected && (
        <table>
          <thead>
            <tr>
              <th>Segment</th>
              <th>Demand</th>
              <th>Drivers</th>
              <th>Density</th>
            </tr>
          </thead>
          <tbody>
            {selected.segments.map(s => (
              <tr key={s.segmentIndex}>
                <td>{s.segmentIndex}</td>
                <td>{s.demandCount}</td>
                <td>{s.driverCount}</td>
                <td>
                  <DensityPill level={s.densityLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}