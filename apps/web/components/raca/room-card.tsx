import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Users, MapPin, AlertCircle } from "lucide-react";

interface RoomCardProps {
  name: string;
  type: string;
  capacity: number;
  // Added 'conflict' to the status type
  status: "available" | "occupied" | "pending" | "conflict";
}

export function RoomCard({ name, type, capacity, status }: RoomCardProps) {
  // Mapping statuses to specific Shadcn/Tailwind styles
  const badgeStyles = {
    available: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    occupied: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    pending: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
    conflict: "bg-orange-100 text-orange-700 border-orange-200 animate-pulse hover:bg-orange-100",
  };

  return (
    <Card className="shadow-sm border-slate-200 hover:border-blue-300 transition-all group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-bold group-hover:text-blue-900 transition-colors">
          {name}
        </CardTitle>
        <Badge variant="outline" className={`${badgeStyles[status]} capitalize font-semibold`}>
          {status === "conflict" && <AlertCircle size={12} className="mr-1" />}
          {status}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400" /> 
            <span>{type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" /> 
            <span>Capacity: <span className="font-medium text-slate-700">{capacity}</span></span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
          <Button 
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white shadow-sm" 
            size="sm"
            disabled={status === "occupied" || status === "conflict"}
          >
            {status === "available" ? "Book Now" : "Request anyway"}
          </Button>
          
          <Button variant="outline" size="sm" className="px-2">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}