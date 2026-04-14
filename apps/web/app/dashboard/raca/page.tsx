"use client";

import { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import { useSession } from "../../../lib/auth-client"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"; 
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Loader2, Check, X, Clock } from "lucide-react"; 
import { submitRacaRequest } from "../../../lib/actions";

export default function RacaFilingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [racas, setRacas] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [state, formAction, isPending] = useActionState(submitRacaRequest, null);

  const API_BASE = "http://10.2.103.35:3001";
  const isAdminOrHead = session?.user?.role === "ADMIN" || session?.user?.role === "HEAD";

  const fetchRacas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/requests`, { credentials: "include" });
      const data = await response.json();
      setRacas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Could not sync with STI Cubao Database");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "DENIED") => {
    try {
      const response = await fetch(`${API_BASE}/requests/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error();
      
      const updatedRequest = await response.json();
      
      // Update local state with fresh data from backend (includes new approval count)
      setRacas((prev) => prev.map((r) => (r.id === id ? updatedRequest : r)));
      
      toast.success(newStatus === "APPROVED" ? "Approval recorded" : "Request Denied");
    } catch (error) {
      toast.error("Update failed. You may have already voted or lack permissions.");
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/rooms`).then(res => res.json()).then(setRooms);
    if (session) fetchRacas();
  }, [session]);

  useEffect(() => {
    if (state?.success) {
      toast.success("RACA Request Logged!");
      fetchRacas();
    }
  }, [state]);

  return (
    <div className="space-y-10 p-6">
      <header>
        <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">RACA Management</h1>
      </header>

      {/* FORM SECTION */}
      <section className="max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border p-5 shadow-sm">
          <form action={formAction} className="space-y-4">
             <select required name="roomName" className="w-full bg-slate-50 border p-2.5 rounded text-xs outline-none">
                <option value="">Select Venue...</option>
                {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
             </select>
             <input required name="items" placeholder="Equipment needed..." className="w-full bg-slate-50 border p-2.5 rounded text-xs" />
             <div className="grid grid-cols-2 gap-2">
                <input required name="startTime" type="datetime-local" className="bg-slate-50 border p-2 text-[10px] rounded" />
                <input required name="endTime" type="datetime-local" className="bg-slate-50 border p-2 text-[10px] rounded" />
             </div>
             <textarea required name="purpose" placeholder="Purpose of activity..." className="w-full bg-slate-50 border p-2.5 rounded text-xs h-24" />
             <Button type="submit" disabled={isPending} className="w-full bg-blue-600 font-bold uppercase text-[10px]">
                {isPending ? "Filing..." : "Submit RACA"}
             </Button>
          </form>
        </div>
        <div className="lg:col-span-7 bg-amber-50 p-6 rounded-xl border border-amber-100 flex flex-col justify-center">
           <h3 className="text-amber-900 font-black uppercase text-xs mb-2 flex items-center gap-2"><Clock size={14}/> Important</h3>
           <p className="text-amber-800 text-xs">Ensure all required fields are accurate. Approvals are final but can be modified by the Department Head if necessary.</p>
        </div>
      </section>

      {/* TRACKING SECTION */}
      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase text-slate-800">Tracking Logs</h2>
        <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-black px-6">Staff</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Activity</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Status</TableHead>
                <TableHead className="text-[10px] uppercase font-black text-center">Items</TableHead>
                <TableHead className="text-[10px] uppercase font-black text-right">Venue</TableHead>
                {isAdminOrHead && <TableHead className="text-right text-[10px] uppercase font-black px-6">Management Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isAdminOrHead ? 6 : 5} className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
              ) : (
                racas.map((r) => {
                  const hasVoted = r.approvals?.some((a: any) => a.approverId === session?.user?.id);
                  
                  return (
                    <TableRow key={r.id} className="hover:bg-slate-50/50">
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold">{r.user?.name || "Staff Member"}</p>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-[10px] text-slate-500 italic max-w-[150px] truncate">"{r.title || r.purpose}"</p>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={`text-[9px] font-black px-2 py-0.5 w-fit ${
                            r.status === 'APPROVED' ? 'bg-emerald-500' : 
                            r.status === 'DENIED' ? 'bg-red-500' : 'bg-amber-400 text-black'
                          }`}>
                            {r.status || "PENDING"}
                          </Badge>
                          {r.status === 'PENDING' && (
                            <span className="text-[9px] text-slate-400 font-bold">{r.approvals?.length || 0}/10 Signed</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <p className="text-[10px] text-slate-600 font-medium">{r.description || "No items listed"}</p>
                      </TableCell>

                      <TableCell className="text-right text-xs font-bold text-slate-500">{r.room?.name || "Other Venue"}</TableCell>
                      
                      {isAdminOrHead && (
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              disabled={hasVoted || r.status === 'APPROVED' || r.status === 'DENIED'}
                              onClick={() => handleStatusUpdate(r.id, "APPROVED")} 
                              className={`h-7 text-[10px] font-bold ${hasVoted ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-emerald-100'}`}
                            >
                              <Check className="mr-1 h-3 w-3" /> {hasVoted ? 'Voted Approve' : 'Approve'}
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={r.status === 'DENIED' || r.status === 'APPROVED'}
                              onClick={() => handleStatusUpdate(r.id, "DENIED")} 
                              className={`h-7 text-[10px] font-bold ${r.status === 'DENIED' ? 'bg-red-700' : 'bg-slate-200 text-slate-600 hover:bg-red-100'}`}
                            >
                              <X className="mr-1 h-3 w-3" /> {r.status === 'DENIED' ? 'Denied' : 'Deny'}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}