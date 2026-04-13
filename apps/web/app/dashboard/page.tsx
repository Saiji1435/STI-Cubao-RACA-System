"use client";

import { useActionState, useEffect, useState } from "react";
import { useSession } from "../../lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, CheckCircle, Clock, Activity, MapPin, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { submitRacaRequest } from "../../lib/actions"; // Import your server action

export default function OverviewPage() {
  const { data: session, isPending: sessionLoading } = useSession();

  if (sessionLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  const isAdminOrHead = userRole === "ADMIN" || userRole === "HEAD";

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
            {isAdminOrHead ? "Management Overview" : "System Overview"}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Welcome back, {session?.user?.name} 
            <span className="ml-2 text-blue-600">[{userRole}]</span>
          </p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase">System Status</p>
           <p className="text-xs font-bold text-emerald-600">● Live on {process.env.NEXT_PUBLIC_API_URL || '10.2.103.35'}</p>
        </div>
      </div>

      {isAdminOrHead ? <AdminDashboardView /> : <StaffDashboardView />}
    </div>
  );
}

/* --- ADMIN & HEAD VIEW --- */
function AdminDashboardView() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = "http://10.2.103.35:3001";

  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      // We use credentials: "include" to pass the session to the backend
      const response = await fetch(`${API_BASE}/requests`, { 
        credentials: "include" 
      });
      const data = await response.json();

      console.log("RAW DATA FROM BACKEND:", data);
      
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to sync system logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Filter logic for the search bar
  const filteredRequests = requests.filter((req) => {
    const search = searchTerm.toLowerCase();
    return (
      req.purpose?.toLowerCase().includes(search) ||
      req.room?.name?.toLowerCase().includes(search) || // Note: req.room.name
      req.user?.name?.toLowerCase().includes(search)    // Note: req.user.name
    );
  });

  return (
    <div className="space-y-6">
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Filings" value={requests.length.toString()} icon={<Activity size={18} className="text-blue-500" />} />
        <StatCard label="Pending" value={requests.filter(r => r.status === 'PENDING').length.toString()} icon={<Clock size={18} className="text-amber-500" />} />
        <StatCard label="Approved" value={requests.filter(r => r.status === 'APPROVED').length.toString()} icon={<CheckCircle size={18} className="text-emerald-500" />} />
        <StatCard label="Departments" value="4" icon={<Package size={18} className="text-indigo-500" />} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-700">Recent System Logs</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Cross-Department Activity</p>
            </div>
            
            {/* SEARCH BAR */}
            <div className="relative w-full md:w-72">
              <input 
                type="text"
                placeholder="Search purpose, room, or staff..."
                className="w-full pl-8 pr-4 py-2 text-xs border rounded-lg outline-none focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Activity size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500">Requestor</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500">Venue</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500">Purpose</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-500 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="text-xs font-bold text-slate-700">{req.user?.name || "Staff"}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black">{req.user?.department || "STI CUBAO"}</p>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">{req.room?.name || "N/A"}</span>
                         </div>
                      </td>
                      <td className="p-4 text-xs text-slate-600 italic truncate max-w-[200px]">"{req.purpose}"</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${
                          req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-[10px] font-bold text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-10 text-center text-xs text-slate-400 font-bold uppercase">No matching logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- STAFF VIEW --- */
function StaffDashboardView() {
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = "http://10.2.103.35:3001";

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/requests`, { 
        credentials: "include" 
      });
      const data = await response.json();
      setUserRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch personal stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  // Calculate dynamic stats
  const pending = userRequests.filter(r => r.status === 'PENDING').length;
  const approved = userRequests.filter(r => r.status === 'APPROVED').length;
  const total = userRequests.length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <div className="col-span-3 text-center py-4"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
        ) : (
          <>
            <StatCard label="Your Pending" value={pending.toString()} icon={<Clock className="text-orange-500" size={18}/>} />
            <StatCard label="Your Approved" value={approved.toString()} icon={<CheckCircle className="text-green-500" size={18}/>} />
            <StatCard label="Total Requests" value={total.toString()} icon={<FileText className="text-blue-500" size={18}/>} />
          </>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Ready to File?</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          Submit your requests for venue and equipment. Remember the STI Cubao 2-day lead time rule.
        </p>
        <Link href="/dashboard/raca">
          <Button size="lg" className="bg-slate-900 hover:bg-black font-bold px-10">
            Open RACA Filing Form
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    </div>
  );
}