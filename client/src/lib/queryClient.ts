import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "./env";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = `${API_BASE_URL}${url}`;

  // Get the auth token from the user's session
  let authToken = '';
  try {
    authToken = sessionStorage.getItem('authToken') || '';
  } catch (e) {
    console.warn('Failed to get auth token:', e);
  }

  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
  };

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = `${API_BASE_URL}${queryKey[0]}`;

    // Get auth token for queries
    let authToken = '';
    try {
      authToken = sessionStorage.getItem('authToken') || '';
    } catch (e) {
      console.warn('Failed to get auth token:', e);
    }

    const headers: Record<string, string> = {
      ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
    };

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});