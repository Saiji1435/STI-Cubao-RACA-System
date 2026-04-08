import { RequestForm } from "../components/raca/request-form";
import { RoomCard } from "../components/raca/room-card";

const roomsData = [
  { id: 1, name: "AVR 1", type: "Audio Visual", capacity: 50, status: "available" as const },
  { id: 2, name: "Comp Lab 2", type: "Computer Laboratory", capacity: 40, status: "occupied" as const },
];

export default function SchedulesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Room Availability</h1>
        <p className="text-slate-500">View and request institutional facilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2. Map through the data to render RoomCards with the required 'capacity' prop */}
          {roomsData.map((room) => (
            <RoomCard 
              key={room.id}
              name={room.name} 
              type={room.type} 
              capacity={room.capacity} // ✅ Fixes the "Property 'capacity' is missing" error
              status={room.status} 
            />
          ))}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Request a Facility</h2>
            {/* 3. Pass the rooms array into the RequestForm so the Select dropdown works */}
            <RequestForm rooms={roomsData} />
          </div>
        </div>
      </div>
    </div>
  );
}