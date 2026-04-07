import { AlertTriangle } from "lucide-react";

interface ConflictProps {
  conflictingEvent: string;
  timeSlot: string;
}

export function ConflictAlert({ conflictingEvent, timeSlot }: ConflictProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
      <AlertTriangle className="text-red-600 shrink-0" size={20} />
      <div>
        <p className="text-sm font-bold text-red-800">Schedule Conflict</p>
        <p className="text-xs text-red-700">
          This room is already reserved for <strong>{conflictingEvent}</strong> during <strong>{timeSlot}</strong>.
        </p>
      </div>
    </div>
  );
}