// apps/web/hooks/use-inventory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../lib/config";

export function useInventory() {
  const queryClient = useQueryClient();

  const useGetItems = () => useQuery({
    queryKey: ["inventory"],
    queryFn: () => fetch(`${API_BASE}/inventory`, { credentials: "include" }).then(res => res.json())
  });

  const useUpdateItem = () => useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    }
  });

  return { useGetItems, useUpdateItem };
}