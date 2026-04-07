// apps/web/app/schedules/page.tsx
import { RequestForm } from "../components/raca/request-form";
import { RoomCard } from "../components/raca/room-card";

export default function SchedulesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Room Availability</h1>
        <p className="text-slate-500">View and request institutional facilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* These come from your components/raca/ folder */}
          <RoomCard name="AVR 1" type="Audio Visual" status="available" />
          <RoomCard name="Comp Lab 2" type="Computer Laboratory" status="occupied" />
        </div>
        
        <div>
          <RequestForm />
        </div>
      </div>
    </div>
  );
}