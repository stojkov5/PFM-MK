// src/pages/Admin/useAdminApi.js
import { useMemo } from "react";
import { useAuth } from "@clerk/react";
import { apiGet, apiPost, apiDelete } from "../../lib/api.js";

// API helpers that attach a fresh Clerk session token to every admin request.
// getToken() caches and refreshes the short-lived token for us.
export const useAdminApi = () => {
  const { getToken } = useAuth();

  return useMemo(
    () => ({
      get: async (url) => apiGet(url, { token: await getToken() }),
      post: async (url, data) => apiPost(url, data, { token: await getToken() }),
      del: async (url) => apiDelete(url, { token: await getToken() }),
    }),
    [getToken]
  );
};
