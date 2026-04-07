import { Plus, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">System overview for the Acting Head</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
          <Plus size={18} /> New Request
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending Requests", value: "12", color: "text-amber-600", icon: Clock },
          { label: "Confirmed Bookings", value: "48", color: "text-emerald-600", icon: CheckCircle2 },
          { label: "System Conflicts", value: "2", color: "text-red-600", icon: ArrowUpRight },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white border rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-bold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  {i}
                </div>
                <div>
                  <p className="text-sm font-medium">New room request for "Science Fair"</p>
                  <p className="text-xs text-slate-400">2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">View</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}