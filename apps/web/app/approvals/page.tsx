import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Check, X, Eye } from "lucide-react";

const pendingRequests = [
  {
    id: "REQ-001",
    requester: "Dr. Smith",
    room: "Computer Lab 1",
    date: "Oct 24, 2023",
    time: "10:00 AM - 12:00 PM",
    purpose: "CS101 Midterm Exam",
  },
  {
    id: "REQ-002",
    requester: "Prof. Jones",
    room: "AVR Room",
    date: "Oct 25, 2023",
    time: "2:00 PM - 4:00 PM",
    purpose: "Guest Lecture Series",
  },
];

export default function ApprovalsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <Badge variant="secondary">{pendingRequests.length} New Requests</Badge>
      </div>

      <div className="space-y-4">
        {pendingRequests.map((req) => (
          <div key={req.id} className="bg-white border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {req.id}
                </span>
                <h3 className="font-bold text-slate-900">{req.purpose}</h3>
              </div>
              <p className="text-sm text-slate-500">
                Requested by <span className="font-medium text-slate-700">{req.requester}</span> for {req.room}
              </p>
              <p className="text-xs text-slate-400">{req.date} | {req.time}</p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2">
                <Eye size={14} /> Details
              </Button>
              <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100">
                <X size={14} /> Deny
              </Button>
              <Button size="sm" className="flex-1 md:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Check size={14} /> Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}