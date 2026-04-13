"use client";

import { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import { useSession } from "../../../lib/auth-client"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"; 
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Loader2, Activity, MapPin } from "lucide-react"; 
import { submitRacaRequest } from "../../../lib/actions";

export default function RacaFilingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [racas, setRacas] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]); // State for dropdown
  const API_BASE = "http://10.2.103.35:3001";

  const [state, formAction, isPending] = useActionState(submitRacaRequest, null);

  // Fetch Rooms for the dropdown
  const fetchRooms = async () => {
    try {
      console.log("Fetching rooms from:", `${API_BASE}/rooms`);
      const response = await fetch(`${API_BASE}/rooms`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log("Rooms received:", data); // Check if this shows the array in console
      
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error details:", error);
      toast.error("Failed to load room list");
    }
  };

  const fetchRacas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/requests`, {
          credentials: "include", 
        });
        const data = await response.json();
        
        // The backend already handles filtering! 
        // If I'm Faculty, the backend only sends my requests.
        // If I'm Admin, it sends everything.
        setRacas(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error("Failed to fetch RACAs", error);
        toast.error("Could not sync with STI Cubao Database");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchRooms(); // Load rooms immediately
    if (session) {
      fetchRacas(); // Only load private RACA data if session exists
    }
  }, [session]);

  useEffect(() => {
    if (state?.success) {
      toast.success("RACA Request Logged Successfully!");
      fetchRacas();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-10 p-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">RACA Management</h1>
        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
          STI College Cubao | Activity & Venue Filing
        </p>
      </div>

      <section className="max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 p-4 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-blue-400" />
            Manual RACA Entry
          </div>
          
          <form action={formAction} className="p-5 space-y-4">
            <div className="space-y-3">
              {/* DROPDOWN FOR ROOMS */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <MapPin size={10} /> Location / Room
                </label>
                <select 
                  required 
                  name="roomName" // Must match your DTO/Action key
                  defaultValue=""
                  className="w-full bg-slate-50 border p-2.5 rounded text-xs outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a venue...</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name} — {room.floor} Floor
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Equipment Needed</label>
                <input required name="items" placeholder="Projector, Microphones..." className="w-full bg-slate-50 border p-2.5 rounded text-xs outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Start Time</label>
                  <input required name="startTime" type="datetime-local" className="w-full bg-slate-50 border p-2 text-[10px] rounded" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">End Time</label>
                  <input required name="endTime" type="datetime-local" className="w-full bg-slate-50 border p-2 text-[10px] rounded" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Activity Purpose</label>
                <textarea required name="purpose" placeholder="Briefly describe the event objectives..." className="w-full bg-slate-50 border p-2.5 rounded text-xs h-24" />
              </div>
              
              <button 
                type="submit"
                disabled={isPending} 
                className="w-full bg-blue-600 text-white py-3 rounded font-black text-[11px] uppercase tracking-tighter hover:bg-blue-700 transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {isPending ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Processing...</> : "Submit RACA Request"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-7 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col justify-center">
          <h3 className="text-blue-900 font-black uppercase text-sm mb-2">Notice to Faculty & Staff</h3>
          <p className="text-blue-700 text-xs leading-relaxed mb-4">
            All campus activities must be filed at least **2 days** in advance. Ensure that the room is available in the Schedules tab before submitting this form.
          </p>
          <div className="flex gap-2">
             <Badge className="bg-blue-600">STI Cubao</Badge>
             <Badge variant="outline" className="border-blue-300 text-blue-600 uppercase text-[9px]">v2.0 Beta</Badge>
          </div>
        </div>
      </section>

      {/* TRACKING TABLE SECTION */}
      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">Your Filing History</h2>
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-[10px] font-black uppercase">Activity / Nature</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase">Action</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase">Date Filed</TableHead>                
                 </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" />
                  </TableCell>
                </TableRow>
              ) : (
                racas.map((raca) => (
                  <TableRow key={raca.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-700 text-xs">{raca.title || raca.purpose || "Untitled Activity"}</TableCell>
                    <TableCell>
                      <Badge variant={raca.status === "APPROVED" ? "default" : "secondary"} className="text-[9px] font-black px-2 py-0.5">
                        {raca.status?.replace(/_/g, " ") || "PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                       <span className="text-[10px] text-slate-400 mr-2">{raca.room?.name}</span>
                    </TableCell>
                    <TableCell className="text-right text-[10px] text-slate-400 font-bold">
                      {new Date(raca.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}