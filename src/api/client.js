import { API_BASE } from '../config/constants';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  // Handle 202 Accepted (demand signal) and other non-JSON gracefully
  const text = await res.text();
  if (!text) return null;
  const json = JSON.parse(text);
  if (json.success === false) throw new Error(json.error?.message || 'API error');
  return json.data ?? json;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const registerUser        = (name, phoneNumber) =>
  request('POST', '/users/register', { name, phoneNumber });

export const getUser             = (id) =>
  request('GET', `/users/${id}`);

export const createDemandSignal  = (userId, corridorId, latitude, longitude) =>
  request('POST', `/users/${userId}/demand`, { corridorId, latitude, longitude });

export const cancelDemandSignal  = (userId, signalId) =>
  request('DELETE', `/users/${userId}/demand/${signalId}`);

// ─── Drivers ──────────────────────────────────────────────────────────────────
export const registerDriver      = (payload) =>
  request('POST', '/drivers/register', payload);

export const updateDriverStatus  = (id, status, corridorId) =>
  request('PATCH', `/drivers/${id}/status`, { status, corridorId });

export const updateLocation      = (id, latitude, longitude, speedKmh) =>
  request('PUT', `/drivers/${id}/location`, { latitude, longitude, speedKmh });

export const getCorridorHeatmap  = (id) =>
  request('GET', `/drivers/${id}/corridor-heatmap`);

export const startTrip           = (id) =>
  request('POST', `/drivers/${id}/trips`, {});

export const recordPickup        = (id, tripId) =>
  request('PATCH', `/drivers/${id}/trips/${tripId}/pickup`);

export const endTrip             = (id, tripId) =>
  request('PATCH', `/drivers/${id}/trips/${tripId}/end`);

// ─── Corridors ────────────────────────────────────────────────────────────────
export const listCorridors       = () =>
  request('GET', '/corridors');

export const getCorridor         = (id) =>
  request('GET', `/corridors/${id}`);

export const getCorridorDemand   = (id) =>
  request('GET', `/corridors/${id}/demand`);
export const api = {
  registerUser,
  getUser,
  createDemandSignal,
  cancelDemandSignal,
};