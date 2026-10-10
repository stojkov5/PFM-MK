// src/lib/api.js

// In production the API lives on a different origin (Railway). Set VITE_API_URL
// (e.g. https://your-api.up.railway.app) in the Vercel project so calls hit it.
// In local dev VITE_API_URL is unset, so requests stay relative and go through
// the Vite dev proxy to localhost:3001.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

const resolve = (url) =>
  API_BASE && url.startsWith("/api") ? `${API_BASE}${url}` : url;

// Full URL for an API path stored in content, e.g. an uploaded image
// ("/api/media/<id>"). Anything else is returned unchanged.
export const apiUrl = (url) => (typeof url === "string" ? resolve(url) : url);

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

// `token` is a Clerk session token; when given it's sent as a Bearer header
// (used by the admin panel — public endpoints don't need it).
const headers = (token, extra = {}) =>
  token ? { ...extra, Authorization: `Bearer ${token}` } : extra;

export const apiGet = (url, { token } = {}) =>
  fetch(resolve(url), { headers: headers(token) }).then(json);

export const apiPost = (url, data, { token } = {}) =>
  fetch(resolve(url), {
    method: "POST",
    headers: headers(token, { "Content-Type": "application/json" }),
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(json);

export const apiPut = (url, data, { token } = {}) =>
  fetch(resolve(url), {
    method: "PUT",
    headers: headers(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

// Sends a File/Blob as the raw request body (see server/routes/media.js).
export const apiUpload = (url, file, { token, name = file.name } = {}) =>
  fetch(resolve(`${url}?name=${encodeURIComponent(name ?? "file")}`), {
    method: "POST",
    headers: headers(token, { "Content-Type": file.type }),
    body: file,
  }).then(json);

export const apiDelete = (url, { token } = {}) =>
  fetch(resolve(url), { method: "DELETE", headers: headers(token) }).then(json);
