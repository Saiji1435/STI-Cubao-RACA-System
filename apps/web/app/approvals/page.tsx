"use client";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Check, X, Eye, Loader2, Inbox } from "lucide-react";
// 1. Import your new custom hooks
import { useAuth } from "../../hooks/use-auth";
import { useRaca } from "../../hooks/use-raca";

export default function ApprovalsPage() {
  // 2. Access auth state (checks if you are HEAD or ADMIN)
  const { isPrivileged, isPending: authLoading } = useAuth();
  
  // 3. Access RACA data and mutation methods
  const { usePendingRequests, useUpdateStatus } = useRaca();
  const { data: requests, isLoading: dataLoading } = usePendingRequests();
  const mutation = useUpdateStatus();

  // 4. Permission Guard: If they aren't authorized, don't show the queue
  if (!authLoading && !isPrivileged) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-red-600 font-black uppercase tracking-widest">Access Denied</h2>
        <p className="text-xs text-slate-500">Only the Department Head or Admin can access this queue.</p>
      </div>
    );
  }

  // 5. Loading State
  if (dataLoading || authLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-400">
      <Loader2 className="animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-center">
        Syncing with STI Cubao Database...
      </span>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Pending Approvals</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STI College Cubao | RACA Queue</p>
        </div>
        <Badge className="bg-blue-600 text-white border-none px-3 py-1">
          {requests?.length || 0} New Requests
        </Badge>
      </div>

      <div className="space-y-4">
        {requests?.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
            <Inbox className="mx-auto mb-2 opacity-20" size={40} />
            <p className="text-xs font-bold uppercase tracking-widest">Queue Clear. No pending requests.</p>
          </div>
        )}

        {requests?.map((req: any) => (
          <div key={req.id} className="bg-white border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-blue-200 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                  {req.id.substring(0, 8)}
                </span>
                <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">{req.purpose}</h3>
              </div>
              <p className="text-sm text-slate-500">
                Requested by <span className="font-bold text-slate-700 uppercase">{req.requesterName}</span> for <span className="text-blue-600 font-bold uppercase">{req.room?.name}</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {req.startTime} — {req.endTime}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 md:flex-none gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Eye size={14} /> Details
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => mutation.mutate({ id: req.id, status: "REJECTED" })}
                disabled={mutation.isPending}
                className="flex-1 md:flex-none gap-2 text-red-600 hover:bg-red-50 border-red-100 text-[10px] font-black uppercase tracking-widest"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />} 
                Deny
              </Button>
              
              <Button 
                size="sm" 
                onClick={() => mutation.mutate({ id: req.id, status: "APPROVED" })}
                disabled={mutation.isPending}
                className="flex-1 md:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}