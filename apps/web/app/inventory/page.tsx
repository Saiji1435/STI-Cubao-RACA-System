"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";
import { useSession } from "../../lib/auth-client"; // Import session hook
import { Package, MapPin, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function InventoryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => apiFetch("/inventory"),
    // Only fetch if user is authorized
    enabled: !!session && (session.user.role === "ADMIN" || session.user.role === "HEAD"),
  });

  // 1. Handle Loading State for Session
  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. Security Check: Restricted Access UI
  const isAdminOrHead = session?.user?.role === "ADMIN" || session?.user?.role === "HEAD";

  if (!isAdminOrHead) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-sm font-black uppercase text-slate-800 tracking-tighter">Access Denied</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">This module is restricted to Department Heads and Administrators only.</p>
      </div>
    );
  }

  const handleMarkDefective = async (id: string) => {
    setProcessingId(id);
    try {
      await apiFetch(`/inventory/${id}/defective`, { 
        method: "PATCH" 
      });
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (itemsLoading) return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
      <span className="text-[10px] font-black uppercase text-slate-400">Syncing STI Assets...</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#0f172a] p-4 flex justify-between items-center">
        <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" /> Equipment Management
        </h2>
        <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-900/30 px-2 py-1 rounded">
          Authorized Access: {session.user.role}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
              <th className="p-4">Asset Name</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4">Assigned Room</th>
              <th className="p-4">Condition</th>
              <th className="p-4 text-right">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 uppercase">{item.itemName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">ID: {item.id}</span>
                  </div>
                </td>
                
                <td className="p-4 text-center">
                  <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-600">
                    {item.quantity}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {item.room?.name || "Unassigned"}
                  </div>
                </td>

                <td className="p-4">
                  {item.condition === "DEFECTIVE" ? (
                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 w-fit text-[9px] font-black uppercase">
                      <AlertCircle size={12} /> Defective
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-fit text-[9px] font-black uppercase">
                      <CheckCircle2 size={12} /> Good Condition
                    </div>
                  )}
                </td>

                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleMarkDefective(item.id)}
                    disabled={item.condition === "DEFECTIVE" || processingId === item.id}
                    className="text-[9px] font-black uppercase px-3 py-1 bg-white border border-slate-200 text-slate-400 rounded hover:border-red-600 hover:text-red-600 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {processingId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Mark Defective"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}