"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "../../lib/auth-client"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"; 
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loader2, Check, X, ShieldCheck } from "lucide-react"; 
import { updateRacaStatus } from "../../lib/actions";

export default function RacaApprovalPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [racas, setRacas] = useState<any[]>([]);
  const API_BASE = "http://10.2.103.35:3001";

  // DEFINED PERMISSIONS based on your STI Cubao roles
  const canDecide = [
    // Heads
    "ACADEMIC_HEAD", "COM_LAB_HEAD", "STUDENT_AFFAIRS_HEAD", 
    // Admins
    "DEPUTY_SCHOOL_ADMIN", "BUILDING_ADMIN", 
    // Program Heads (IT, THBM, Computer Engineering, PHA&S)
    "PROGRAM_HEAD" 
  ].includes(session?.user?.role || "");

  const fetchRacas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/requests`, { credentials: "include" });
      const data = await response.json();
      setRacas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Database sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchRacas();
  }, [session]);

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "DENIED" | "PENDING") => {
    // Optimistic Update: Reflect changes immediately for the Admin/Head
    const previousState = [...racas];
    setRacas(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

    const result = await updateRacaStatus(id, newStatus);
    
    if (result.error) {
      setRacas(previousState); // Revert if backend fails
      toast.error(result.error);
    } else {
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Administrative Approval
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            STI College Cubao | Request for Approval of Campus Activity
          </p>
        </div>
        {canDecide && (
          <Badge variant="outline" className="border-blue-200 text-blue-700 font-bold px-3 py-1">
            {session?.user?.role?.replace("_", " ")} Access Level
          </Badge>
        )}
      </header>

      <section className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-[10px] font-black px-6 py-4 uppercase">Activity & Venue</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Current Status</TableHead>
              <TableHead className="text-right text-[10px] font-black px-6 uppercase">Decision Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></TableCell></TableRow>
            ) : racas.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center text-slate-400 text-xs font-bold uppercase">No requests pending for approval</TableCell></TableRow>
            ) : (
              racas.map((raca) => (
                <TableRow key={raca.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{raca.title || raca.purpose}</div>
                    <div className="text-[10px] text-blue-500 font-black uppercase">{raca.room?.name || "No Venue"}</div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={`text-[9px] font-black px-2 py-0.5 shadow-sm border ${
                      raca.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                      raca.status === "DENIED" ? "bg-rose-50 text-rose-700 border-rose-200" : 
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {raca.status || "PENDING"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right px-6">
                    {canDecide ? (
                      <div className="flex justify-end items-center gap-2">
                        {/* APPROVE BUTTON: Green if active, outline if not */}
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(raca.id, "APPROVED")}
                          className={`h-8 text-[10px] font-black uppercase transition-all ${
                            raca.status === "APPROVED" 
                            ? "bg-emerald-600 text-white shadow-md" 
                            : "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 border"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${raca.status === "APPROVED" ? "mr-1" : "mr-0"}`} />
                          {raca.status === "APPROVED" ? "Approved" : ""}
                        </Button>

                        {/* DENY BUTTON: Red if active, outline if not */}
                        <Button 
                          size="sm"
                          variant={raca.status === "DENIED" ? "destructive" : "outline"}
                          onClick={() => handleStatusUpdate(raca.id, "DENIED")}
                          className={`h-8 text-[10px] font-black uppercase transition-all ${
                            raca.status !== "DENIED" && "border-rose-200 text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          <X className={`w-3 h-3 ${raca.status === "DENIED" ? "mr-1" : "mr-0"}`} />
                          {raca.status === "DENIED" ? "Not Approved" : ""}
                        </Button>
                        
                        {/* RESET BUTTON: Small text link for corrections */}
                        {(raca.status === "APPROVED" || raca.status === "DENIED") && (
                          <button 
                            onClick={() => handleStatusUpdate(raca.id, "PENDING")}
                            className="text-[9px] text-slate-400 hover:text-blue-600 underline font-bold transition-colors ml-1"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end text-[10px] text-slate-300 font-bold uppercase italic">
                         Read Only Access
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}