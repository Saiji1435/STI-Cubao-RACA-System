// apps/web/hooks/use-raca.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../lib/config";

// We use standard fetch with credentials to ensure the 
// session cookie from Better Auth is sent to your backend
async function authenticatedFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include", // CRITICAL for Better Auth sessions
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

export function useRaca() {
  const queryClient = useQueryClient();

  // Fetch active RACA requests for the current user/admin
  const usePendingRequests = () => 
    useQuery({
      queryKey: ["raca-list"],
      queryFn: () => authenticatedFetch("/raca/active"),
    });

  // Mutation to Sign/Approve or Deny a request
  const useUpdateStatus = () => 
    useMutation({
      mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "DENIED" }) => {
        return authenticatedFetch(`/raca/${id}/approve`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
      },
      onSuccess: () => {
        // Refresh all RACA related data across the dashboard
        queryClient.invalidateQueries({ queryKey: ["raca-list"] });
        // Also invalidate inventory in case a room was booked/released
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
      },
    });

  return {
    usePendingRequests,
    useUpdateStatus,
  };
}