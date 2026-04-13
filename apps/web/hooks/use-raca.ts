// apps/web/hooks/use-raca.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export function useRaca() {
  const queryClient = useQueryClient();

  // Fetch all pending requests
  const usePendingRequests = () => 
    useQuery({
      queryKey: ["approvals-pending"],
      queryFn: () => apiFetch("/requests/pending"),
    });

  // Mutation to Approve or Reject a request
  const useUpdateStatus = () => 
    useMutation({
      mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => {
        return apiFetch(`/requests/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
      },
      onSuccess: () => {
        // Refresh the list immediately
        queryClient.invalidateQueries({ queryKey: ["approvals-pending"] });
      },
    });

  return {
    usePendingRequests,
    useUpdateStatus,
  };
}