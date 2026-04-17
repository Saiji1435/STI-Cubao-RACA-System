"use client";

import { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import { useSession } from "../../../lib/auth-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Loader2, Check, X, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { submitRacaRequest } from "../../../lib/actions";
import { API_BASE, isAuthorized } from "../../../lib/config";

export default function RacaFilingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [racas, setRacas] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [state, formAction, isPending] = useActionState(submitRacaRequest, null);

  const isAdminOrHead = isAuthorized(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "ADMIN_MAIN";

  const fetchRacas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/raca/active`, { credentials: "include" });
      const data = await response.json();
      setRacas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Database sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "DENIED") => {
    try {
      const response = await fetch(`${API_BASE}/raca/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error();
      toast.success(newStatus === "APPROVED" ? "Signature recorded" : "Request Denied");
      fetchRacas(); 
    } catch (error) {
      toast.error("Update failed. Check permissions.");
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/rooms`).then(res => res.json()).then(setRooms).catch(() => {});
    if (session) fetchRacas();
  }, [session]);

  return (
    <div className="space-y-10 p-6">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">RACA Management</h1>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">STI College Cubao Activity Portal</p>
        </div>
        {isSuperAdmin && <Badge className="bg-purple-600 animate-pulse">ADMIN_MAIN ACCESS</Badge>}
      </header>

      <section className="max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border p-5 shadow-sm">
          <form action={formAction} className="space-y-4">
             <select required name="roomId" className="w-full bg-slate-50 border p-2.5 rounded text-xs outline-none">
                <option value="">Select Venue...</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id} disabled={!r.isAvailable}>
                    {r.name} {!r.isAvailable ? "(Unavailable)" : ""}
                  </option>
                ))}
             </select>
             <input required name="natureOfActivity" placeholder="Nature of Activity..." className="w-full bg-slate-50 border p-2.5 rounded text-xs" />
             <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 px-1">Start Date</label>
                  <input required name="startDate" type="datetime-local" className="w-full bg-slate-50 border p-2 text-[10px] rounded" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 px-1">End Date</label>
                  <input required name="endDate" type="datetime-local" className="w-full bg-slate-50 border p-2 text-[10px] rounded" />
                </div>
             </div>
             <textarea required name="objectives" placeholder="Objectives..." className="w-full bg-slate-50 border p-2.5 rounded text-xs h-20" />
             
             <div className="bg-amber-50 border border-amber-200 p-2 rounded flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                <p className="text-[9px] text-amber-800 leading-tight">
                  <strong>Lead Time Rule:</strong> RACA must be filed at least 7 days before the event.
                </p>
             </div>

             <Button type="submit" disabled={isPending} className="w-full bg-blue-600 font-black uppercase text-[10px] py-6">
                {isPending ? "Validating..." : "Submit for Approval Flow"}
             </Button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
           <div className="bg-slate-900 p-6 rounded-xl text-white flex flex-col justify-center h-full">
              <h3 className="font-black uppercase text-xs mb-3 flex items-center gap-2 text-blue-400">
                <ShieldCheck size={16}/> Required Signatories
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {["MIS Admin", "Academic Head", "Deputy School Admin", "Building Admin", "Dept Head", "SA Head"].map((role) => (
                  <div key={role} className="flex items-center gap-2 text-[10px] font-bold text-slate-300 border-b border-slate-800 pb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {role}
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">Active Activity Logs</h2>
        <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-black px-6">Requestor</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Activity Info</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Signature Status</TableHead>
                <TableHead className="text-[10px] uppercase font-black text-right">Venue</TableHead>
                {isAdminOrHead && <TableHead className="text-right text-[10px] uppercase font-black px-6">Review</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isAdminOrHead ? 5 : 4} className="text-center p-12"><Loader2 className="animate-spin mx-auto text-blue-600"/></TableCell></TableRow>
              ) : (
                racas.map((r) => {
                  const hasSigned = r.approvals?.some((a: any) => a.approverId === session?.user?.id);
                  const approvalCount = r.approvals?.length || 0;
                  return (
                    <TableRow key={r.id} className="group hover:bg-slate-50/80 transition-colors">
                      <TableCell className="px-6">
                        <p className="text-xs font-bold text-slate-900">{r.requestor?.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{r.requestor?.role}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[10px] font-bold text-slate-700 uppercase">{r.natureOfActivity}</p>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Clock size={10}/> {new Date(r.startDate).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={`text-[9px] font-black px-2 py-0.5 w-fit rounded-sm ${
                            r.status === 'APPROVED' ? 'bg-emerald-500' :
                            r.status === 'DENIED' ? 'bg-red-500' : 'bg-amber-400 text-black'
                          }`}>
                            {r.status}
                          </Badge>
                          <span className="text-[9px] text-slate-500 font-bold">{approvalCount}/6 SIGNED</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-black text-slate-600">{r.room?.name}</TableCell>
                      {isAdminOrHead && (
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={hasSigned || r.status !== 'PENDING'}
                              onClick={() => handleStatusUpdate(r.id, "APPROVED")}
                              className={`h-7 text-[10px] font-bold ${hasSigned ? 'bg-emerald-100 text-emerald-700 shadow-none' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                              <Check className="mr-1 h-3 w-3" /> 
                              {isSuperAdmin ? 'Master Approve' : hasSigned ? 'Signed' : 'Sign RACA'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={r.status !== 'PENDING'}
                              onClick={() => handleStatusUpdate(r.id, "DENIED")}
                              className="h-7 text-[10px] font-bold"
                            >
                              <X className="mr-1 h-3 w-3" /> Deny
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