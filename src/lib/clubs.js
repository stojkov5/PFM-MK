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

// Choices for a club's "type" (club sign-up and the admin panel; the server
// accepts any short text). The type puts the club in a tab on the Clubs page.
export const CLUB_TYPES = ["Пливачки клуб", "Пливачки ватерполо клуб", "Ватерполо клуб"];
