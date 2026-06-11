// server/lib/validate.js
const TIME_RE = /^\d{1,2}:\d{2}\.\d{2}$/;

export const isValidTime = (v) => typeof v === "string" && TIME_RE.test(v);

export const isValidProofUrl = (v) => {
  if (typeof v !== "string" || v.length > 500) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const text = (v, max = 100) =>
  typeof v === "string" && v.trim().length > 0 && v.trim().length <= max
    ? v.trim()
    : null;

export const validateApplication = (body = {}) => {
  const errors = [];
  const firstName = text(body.firstName);
  const lastName = text(body.lastName);
  const category = text(body.category, 200);
  const discipline = text(body.discipline, 200);
  if (!firstName) errors.push("firstName");
  if (!lastName) errors.push("lastName");
  if (body.gender !== "male" && body.gender !== "female") errors.push("gender");
  if (body.pool !== "25" && body.pool !== "50") errors.push("pool");
  if (!category) errors.push("category");
  if (!discipline) errors.push("discipline");
  if (!isValidTime(body.time)) errors.push("time");
  if (!isValidProofUrl(body.proofUrl)) errors.push("proofUrl");
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      firstName,
      lastName,
      gender: body.gender,
      pool: body.pool,
      category,
      discipline,
      time: body.time,
      proofUrl: body.proofUrl,
    },
  };
};
