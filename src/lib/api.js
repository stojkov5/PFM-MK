// src/lib/api.js
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

export const apiGet = (url) => fetch(url, { credentials: "include" }).then(json);

export const apiPost = (url, data) =>
  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(json);
