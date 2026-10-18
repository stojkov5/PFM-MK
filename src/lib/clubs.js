// src/lib/clubs.js
// The public list of clubs (approved ones, from the API).
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api.js";

export const useClubs = () =>
  useQuery({
    queryKey: ["clubs"],
    queryFn: () => apiGet("/api/clubs"),
    staleTime: 5 * 60_000,
  });

// Choices for the "type" field of a club signing up (the server accepts any
// short text).
export const CLUB_TYPES = ["Пливачки клуб", "Ватерполо клуб"];
