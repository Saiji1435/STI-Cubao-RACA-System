"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";
import { authClient } from "../../lib/auth-client";
// Import the User type from Prisma to fix the TypeScript error
import { User as PrismaUser } from "@prisma/client"; 
import { Calendar, Clock, MapPin, Users, Activity, ShieldAlert, Loader2 } from "lucide-react";

export default function SchedulesPage() {
  // 1. Get the current user session
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  
  // FIX: Cast the user to PrismaUser so .role is recognized
  const user = session?.user as PrismaUser | undefined;
  
  // Now 'role' exists and we can check privileges for your HEAD role
  const isPrivileged = user?.role === "ADMIN" || user?.role === "HEAD";

  // 2. Fetch all approved schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => apiFetch("/schedules"),
  });

  // 3. Fetch logs ONLY if the user is an Admin or Head
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["event-logs"],
    queryFn: () => apiFetch("/event-logs"),
    enabled: isPrivileged, // Security: Only runs if user is Head/Admin
  });

  if (sessionLoading || schedulesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Campus Schedules...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* LEFT COLUMN: The Schedules (Visible to everyone) */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Calendar size={20} /></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">Approved Events</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STI College Cubao | Venue Schedules</p>
          </div>
        </div>

        {schedules?.length === 0 ? (
           <div className="border border-slate-200 bg-slate-50 rounded-xl p-12 text-center text-slate-400">
             <p className="text-xs font-bold uppercase tracking-widest">No scheduled events at this time.</p>
           </div>
        ) : (
          schedules?.map((schedule: any) => (
            <div key={schedule.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">
                  {schedule.raca?.natureOfActivity || "Campus Event"}
                </h3>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                  {schedule.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-500 uppercase">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500"/> 
                  {new Date(schedule.startTime).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-red-500"/> 
                  {schedule.room?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-amber-500"/> 
                  {schedule.attendees} Attendees
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT COLUMN: Event Logs (Protected Area) */}
      {isPrivileged && (
        <div className="w-full lg:w-96 bg-[#0f172a] rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col h-[calc(100vh-120px)] sticky top-6">
          <div className="p-4 border-b border-slate-700 bg-slate-900 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" /> System Logs
            </h2>
            <ShieldAlert size={14} className="text-amber-400" />
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {logsLoading ? (
               <Loader2 className="h-5 w-5 animate-spin text-slate-500 mx-auto" />
            ) : logs?.length === 0 ? (
               <p className="text-[10px] text-slate-500 font-mono text-center">No logs recorded yet.</p>
            ) : (
              logs?.map((log: any) => (
                <div key={log.id} className="border-l-2 border-slate-600 pl-3 py-1">
                  <p className="text-[9px] text-slate-400 font-mono mb-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  <p className="text-[11px] font-bold text-slate-200 leading-tight">
                    <span className="text-blue-400 uppercase tracking-wider text-[9px] mr-2">[{log.action}]</span>
                    {log.summary}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1 font-bold uppercase">
                    User: {log.user?.name || log.userId.substring(0,8)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}