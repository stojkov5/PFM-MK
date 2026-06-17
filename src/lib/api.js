// src/lib/api.js

// In production the API lives on a different origin (Railway). Set VITE_API_URL
// (e.g. https://your-api.up.railway.app) in the Vercel project so calls hit it.
// In local dev VITE_API_URL is unset, so requests stay relative and go through
// the Vite dev proxy to localhost:3001.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

const resolve = (url) =>
  API_BASE && url.startsWith("/api") ? `${API_BASE}${url}` : url;

const json = async (res) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
};

export const apiGet = (url) =>
  fetch(resolve(url), { credentials: "include" }).then(json);

export const apiPost = (url, data) =>
  fetch(resolve(url), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(json);
