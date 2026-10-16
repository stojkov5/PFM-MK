// src/lib/criteria.js
// Criteria PDFs per sport, managed in the admin panel's Criteria tab.
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api.js";

// Keep in sync with CRITERIA_SPORTS in server/lib/criteria.js.
export const CRITERIA_SPORTS = ["swimming", "distance-swimming"];

export const useCriteria = (sport) =>
  useQuery({
    queryKey: ["criteria", sport],
    queryFn: () => apiGet(`/api/criteria?sport=${sport}`),
  });
