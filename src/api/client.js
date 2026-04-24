const API = "http://localhost:8080/api/v1";

export async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "API error");
  }

  return json.data;
}