import { RoomCard } from "../../components/raca/room-card";
import { RequestForm } from "../../components/raca/request-form";

export default function SchedulesPage() {
  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold">Facility Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RoomCard name="Computer Lab 1" type="Laboratory" capacity={40} status="available" />
          <RoomCard name="AVR Room" type="Audio Visual" capacity={100} status="occupied" />
        </div>
      </div>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Quick Request</h2>
        <div className="p-6 bg-white border rounded-xl">
          <RequestForm />
        </div>
      </div>
    </div>
  );
}