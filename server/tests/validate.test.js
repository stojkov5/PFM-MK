// server/tests/validate.test.js
import { describe, it, expect } from "vitest";
import { isValidTime, isValidProofUrl, validateApplication } from "../lib/validate.js";

describe("isValidTime", () => {
  it("accepts m:ss.xx and mm:ss.xx", () => {
    expect(isValidTime("0:26.34")).toBe(true);
    expect(isValidTime("17:06.42")).toBe(true);
  });
  it("rejects bad shapes", () => {
    expect(isValidTime("26.34")).toBe(false);
    expect(isValidTime("0:26")).toBe(false);
    expect(isValidTime("0:266.34")).toBe(false);
    expect(isValidTime("abc")).toBe(false);
    expect(isValidTime("")).toBe(false);
  });
});

describe("isValidProofUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(isValidProofUrl("https://results.swim.mk/meet/1")).toBe(true);
    expect(isValidProofUrl("http://example.com")).toBe(true);
  });
  it("rejects other schemes and garbage", () => {
    expect(isValidProofUrl("javascript:alert(1)")).toBe(false);
    expect(isValidProofUrl("ftp://x")).toBe(false);
    expect(isValidProofUrl("not a url")).toBe(false);
  });
});

describe("validateApplication", () => {
  const good = {
    firstName: "Ana",
    lastName: "Stojanova",
    gender: "female",
    pool: "25",
    category: "Seniors (17+)",
    discipline: "50m Freestyle",
    time: "0:25.99",
    proofUrl: "https://results.example.com/1",
  };
  it("passes a valid application", () => {
    const r = validateApplication(good);
    expect(r.ok).toBe(true);
    expect(r.data.firstName).toBe("Ana");
  });
  it("trims whitespace", () => {
    const r = validateApplication({ ...good, firstName: "  Ana  " });
    expect(r.data.firstName).toBe("Ana");
  });
  it("rejects missing fields, bad gender/pool, long names, bad time/url", () => {
    expect(validateApplication({ ...good, firstName: "" }).ok).toBe(false);
    expect(validateApplication({ ...good, gender: "other" }).ok).toBe(false);
    expect(validateApplication({ ...good, pool: "33" }).ok).toBe(false);
    expect(validateApplication({ ...good, firstName: "x".repeat(101) }).ok).toBe(false);
    expect(validateApplication({ ...good, time: "fast" }).ok).toBe(false);
    expect(validateApplication({ ...good, proofUrl: "nope" }).ok).toBe(false);
  });
});
