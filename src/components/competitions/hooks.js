// src/components/competitions/hooks.js
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../lib/api.js";

// Approved competitions (all years) + the years that have any.
export const useCompetitions = (sport = "swimming") =>
  useQuery({
    queryKey: ["competitions", sport],
    queryFn: () => apiGet(`/api/competitions?sport=${sport}`),
  });

// { status: "open" | "upcoming" | "closed" | "none", season, opensAt, closesAt }
export const useRegistrationWindow = (sport = "swimming") =>
  useQuery({
    queryKey: ["competition-window", sport],
    queryFn: () => apiGet(`/api/competitions/window?sport=${sport}`),
    staleTime: 60_000,
  });
