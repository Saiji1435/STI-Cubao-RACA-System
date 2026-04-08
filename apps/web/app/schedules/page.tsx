"use client";

import { useQuery } from "@tanstack/react-query";
import { RoomCard } from "../../components/raca/room-card";
import { RequestForm } from "../../components/raca/request-form";

async function getRooms() {
  const res = await fetch("http://localhost:3001/rooms"); // Adjust port if needed
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

export default function SchedulesPage() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-blue-900">Institutional Facilities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <p>Loading rooms...</p>
          ) : (
            rooms?.map((room: any) => (
              <RoomCard 
                key={room.id}
                name={room.name} 
                type={room.type} 
                capacity={room.capacity} // 👈 Now coming from DB!
                status="available" 
              />
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <RequestForm rooms={rooms || []} />
      </div>
    </div>
  );
}