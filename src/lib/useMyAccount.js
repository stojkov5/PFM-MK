// src/lib/useMyAccount.js
// The signed-in user's account from the API: { accountType, club } where club
// is their club (any status) with `accountStatus` = the account's own
// approval. Only usable inside the ClerkProvider.
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthedApi } from "./useAuthedApi.js";

export const useMyAccount = () => {
  const { isSignedIn, userId } = useAuth();
  const api = useAuthedApi();
  return useQuery({
    queryKey: ["my-account", userId],
    queryFn: () => api.get("/api/account"),
    enabled: !!isSignedIn,
  });
};
