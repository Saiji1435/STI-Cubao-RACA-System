"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "../../../components/ui/dialog";
import { Package, Loader2, MapPin, Edit3, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../../../lib/auth-client";
import { API_BASE, isAuthorized } from "../../../lib/config";
import { Button } from "../../../components/ui/button";

export default function InventoryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRoomId, setNewRoomId] = useState<number>(0);

  const isAdminOrHead = isAuthorized(session?.user?.role);

  const fetchData = async () => {
    if (!isAdminOrHead) return;
    setIsLoading(true);
    try {
      const [invRes, roomRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`, { credentials: "include" }),
        fetch(`${API_BASE}/rooms`, { credentials: "include" })
      ]);
      const invData = await invRes.json();
      const roomData = await roomRes.json();
      setItems(invData);
      setRooms(roomData);
    } catch (error) {
      toast.error("Failed to sync with STI Cubao Database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && isAdminOrHead) fetchData();
  }, [session, isAdminOrHead]);

  if (sessionLoading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  if (!isAdminOrHead) return <RestrictedView />;

  const handleUpdate = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/inventory/${selectedItem.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: newStatus, roomId: Number(newRoomId) }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${selectedItem.itemName} updated`);
      setSelectedItem(null); 
      fetchData(); 
    } catch (err) {
      toast.error("Network error: Could not save changes");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Inventory Management</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">STI College Cubao | MIS Asset Tracking</p>
        </div>
        <Badge className="bg-blue-600 text-white font-black text-[9px] uppercase px-3">
          {session?.user?.role} Access
        </Badge>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase px-6 py-4">Item Name</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Storage Location</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Current Status</TableHead>
              <TableHead className="text-right px-6 text-[10px] font-black uppercase">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin text-blue-600 mx-auto" /></TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 font-bold text-slate-700">
                    <div className="flex items-center gap-3"><Package size={16} className="text-slate-400" />{item.itemName}</div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {item.room?.name || "Unassigned"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[9px] font-black uppercase px-2 py-0.5 ${
                      item.condition === 'GOOD' ? 'bg-green-100 text-green-700' : 
                      item.condition === 'DEFECTIVE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{item.condition?.replace('_', ' ') || "PENDING"}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Dialog open={selectedItem?.id === item.id} onOpenChange={(open) => !open && setSelectedItem(null)}>
                      <DialogTrigger asChild>
                        <button onClick={() => { setSelectedItem(item); setNewStatus(item.condition); setNewRoomId(item.roomId); }}
                          className="p-2 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition-all border border-transparent hover:border-blue-700">
                          <Edit3 size={16} />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader><DialogTitle className="font-black uppercase text-2xl">Update Asset Info</DialogTitle></DialogHeader>
                        <div className="py-6 space-y-4">
                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border-2 rounded-xl p-3 text-sm font-bold bg-slate-50">
                            <option value="GOOD">Operational (GOOD)</option>
                            <option value="DEFECTIVE">Defective / Broken</option>
                            <option value="REPAIR_PENDING">Under Maintenance</option>
                          </select>
                          <select value={newRoomId} onChange={(e) => setNewRoomId(Number(e.target.value))} className="w-full border-2 rounded-xl p-3 text-sm font-bold bg-slate-50">
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                          <Button onClick={handleUpdate} disabled={isUpdating} className="w-full bg-blue-600 font-black uppercase py-6">
                            {isUpdating ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" size={16}/> Save Changes</>}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RestrictedView() {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-slate-50 border-2 border-dashed rounded-3xl">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Restricted Module</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 max-w-[250px] text-center">
            You must be an Authorized Admin or Department Head to manage STI Cubao assets.
          </p>
        </div>
    );
}