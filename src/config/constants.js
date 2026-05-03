export const API_BASE = 'http://localhost:8080/api/v1';
export const WS_BASE  = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host;

export const DENSITY_CONFIG = {
  EMPTY:  { color: '#888780', bg: '#F1EFE8', border: '#D3D1C7', label: 'Empty',  bar: '#D3D1C7' },
  LOW:    { color: '#3B6D11', bg: '#EAF3DE', border: '#97C459', label: 'Low',    bar: '#97C459' },
  MEDIUM: { color: '#185FA5', bg: '#E6F1FB', border: '#378ADD', label: 'Medium', bar: '#378ADD' },
  HIGH:   { color: '#854F0B', bg: '#FAEEDA', border: '#EF9F27', label: 'High',   bar: '#EF9F27' },
  SURGE:  { color: '#A32D2D', bg: '#FCEBEB', border: '#E24B4A', label: 'Surge',  bar: '#E24B4A' },
};

export const GUIDANCE_CONFIG = {
  CONTINUE:      { icon: '→',  label: 'Continue',       urgencyColor: '#3B6D11' },
  SPEED_UP:      { icon: '↑',  label: 'Speed Up',       urgencyColor: '#185FA5' },
  SLOW_DOWN:     { icon: '↓',  label: 'Slow Down',      urgencyColor: '#854F0B' },
  SURGE_FORWARD: { icon: '⚡', label: 'Surge Forward',  urgencyColor: '#A32D2D' },
  REDISTRIBUTE:  { icon: '⇄',  label: 'Redistribute',   urgencyColor: '#533AB7' },
  RETURN:        { icon: '←',  label: 'Return',         urgencyColor: '#888780' },
};

export const URGENCY_BG = {
  NONE:     '#F1EFE8',
  LOW:      '#EAF3DE',
  MEDIUM:   '#E6F1FB',
  HIGH:     '#FAEEDA',
  CRITICAL: '#FCEBEB',
};

export const DEMO_CORRIDORS = [
  { id: 'c1', name: 'Gai Ghat → Gandhi Maidan', code: 'GG_GM', totalSegments: 8, isActive: true },
  { id: 'c2', name: 'Patna Jn → Boring Road',   code: 'PJ_BR', totalSegments: 6, isActive: true },
  { id: 'c3', name: 'Dak Bungalow → Bailey Road',code: 'DB_BR', totalSegments: 5, isActive: true },
];

export const DEMO_SEGMENTS = (n = 8) =>
  Array.from({ length: n }, (_, i) => ({
    segmentIndex: i,
    demandCount:  [2,5,9,14,4,1,0,3][i] ?? Math.floor(Math.random() * 10),
    driverCount:  [3,2,2,1,2,2,1,2][i] ?? Math.floor(Math.random() * 3 + 1),
    densityLevel: ['LOW','MEDIUM','HIGH','SURGE','MEDIUM','LOW','EMPTY','MEDIUM'][i] ?? 'MEDIUM',
  }));