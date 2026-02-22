// apiFetch.ts
const REFRESH_PATH = "/api/auth/refresh";

let refreshPromise: Promise<boolean> | null = null;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  secure: Boolean = true,
) {
  options.credentials = "include";

  const config: RequestInit = {
    ...options,
    headers: {
      "X-Requested-With": "CrimsonApp",
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(`${endpoint}`, config);

  // 1. Check if we hit a 401
  if (response.status === 401) {
    // 2. CRITICAL: If the request that failed WAS the refresh request,
    // do NOT retry. Just fail immediately to prevent infinite loops.
    if (endpoint === REFRESH_PATH) {
      window.location.href = "/login";
      throw new Error("Refresh token expired");
    }

    // 3. Normal refresh logic for other routes
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await fetch(`${REFRESH_PATH}`, {
            method: "POST",
            credentials: "include",
            headers: { "X-Requested-With": "CrimsonApp" },
          });
          return res.ok;
        } catch {
          return false;
        }
      })();
    }

    const success = await refreshPromise;
    refreshPromise = null;

    if (success) {
      // Retry original request
      return fetch(`${endpoint}`, config);
    } else {
      if (secure) {
        window.location.href = "/login";
      }
      throw new Error("Session expired");
    }
  }

  return response;
}
