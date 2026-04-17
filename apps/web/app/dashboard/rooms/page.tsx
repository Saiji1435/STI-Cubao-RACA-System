"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import { Loader2, ShieldAlert, Search, School } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../../../lib/auth-client";
import { API_BASE, isAuthorized } from "../../../lib/config";

export default function RoomManagementPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isAdminOrHead = isAuthorized(session?.user?.role);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`, { credentials: "include" });
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) { 
      toast.error("Database sync failed. Check server status."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    if (isAdminOrHead) fetchRooms(); 
  }, [isAdminOrHead]);

  const toggleRoom = async (roomId: number, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isAvailable: updatedStatus } : r));

    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Room ${updatedStatus ? 'Activated' : 'Disabled'}`);
    } catch (err) {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isAvailable: currentStatus } : r));
      toast.error("Failed to update status on server");
    }
  };

  if (!isAdminOrHead) return <RestrictedView />;

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.floor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <School size={18} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Room Status</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">STI College Cubao | Venue Management</p>
        </div>
        
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input 
              placeholder="Filter by room or floor..." 
              className="pl-9 w-full bg-white border h-10 rounded-xl text-xs outline-none focus:ring-2 ring-blue-500/20 shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase px-6 py-4">Venue</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Level</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-center">Current Availability</TableHead>
              <TableHead className="text-right px-6 text-[10px] font-black uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="animate-spin mx-auto text-blue-600"/></TableCell></TableRow>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <TableRow key={room.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-slate-800">{room.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{room.type}</p>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-500 uppercase">{room.floor}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-[9px] font-black rounded-sm px-2 py-0.5 tracking-tight ${
                      room.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {room.isAvailable ? "READY FOR RACA" : "UNDER MAINTENANCE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {room.isAvailable ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch 
                        checked={room.isAvailable} 
                        onCheckedChange={() => toggleRoom(room.id, room.isAvailable)} 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-[10px] font-bold text-slate-400 uppercase">
                  No rooms found matching "{search}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RestrictedView() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white border-2 border-dashed rounded-3xl">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Authorization Required</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 max-w-[280px] text-center leading-relaxed">
            Your current role does not have permission to modify STI Cubao campus facilities.
          </p>
        </div>
    );
}