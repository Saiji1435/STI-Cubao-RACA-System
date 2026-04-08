"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner"; 

interface RequestFormValues {
  roomId: string;
  attendees: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

interface RequestFormProps {
  rooms: any[]; 
}

export function RequestForm({ rooms }: RequestFormProps) {
  const form = useForm<RequestFormValues>({
    defaultValues: {
      roomId: "",
      attendees: 1, 
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
    },
  });

  const selectedRoomId = form.watch("roomId");
  const attendeeCount = form.watch("attendees");
  
  const currentRoom = rooms.find((r) => r.id.toString() === selectedRoomId);
  const isOverCapacity = currentRoom && Number(attendeeCount) > currentRoom.capacity;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split("T")[0];

  async function onSubmit(values: RequestFormValues) {
    try {
      if (!values.roomId || !values.date || !values.startTime || !values.endTime || !values.purpose) {
        toast.error("Please fill out all required fields.");
        return;
      }

      const startDateTime = new Date(`${values.date}T${values.startTime}`);
      const endDateTime = new Date(`${values.date}T${values.endTime}`);

      const response = await fetch("http://localhost:3001/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startDateTime,
          endTime: endDateTime,
          roomId: parseInt(values.roomId),
          attendees: Number(values.attendees),
          purpose: values.purpose,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit request");
      }

      toast.success("Request submitted successfully!");
      form.reset();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Room Selection */}
        {/* 3. We use the 'rules' prop to handle simple validation natively */}
        <FormField control={form.control} name="roomId" rules={{ required: "Facility selection is required" }} render={({ field }) => (
          <FormItem>
            <FormLabel>Select Facility</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name} (Max: {room.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Date Selection */}
        <FormField control={form.control} name="date" rules={{ required: "Date is required" }} render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" min={minDateString} {...field} />
            </FormControl>
            <FormDescription>Minimum 48 hours notice required.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        {/* Attendee Count */}
        <FormField control={form.control} name="attendees" rules={{ required: "Attendee count required", min: 1 }} render={({ field }) => (
          <FormItem>
            <FormLabel>Expected Attendees</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                className={isOverCapacity ? "border-red-500 focus-visible:ring-red-500" : ""} 
              />
            </FormControl>
            {isOverCapacity && (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Exceeds {currentRoom?.name} capacity ({currentRoom?.capacity}).
              </p>
            )}
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startTime" rules={{ required: "Start time required" }} render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="endTime" rules={{ required: "End time required" }} render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="purpose" rules={{ required: "Purpose is required", minLength: 5 }} render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Department Meeting" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button 
          type="submit" 
          disabled={isOverCapacity}
          className={`w-full ${isOverCapacity ? 'bg-slate-400' : 'bg-blue-900 hover:bg-blue-800'}`}
        >
          {isOverCapacity ? "Capacity Exceeded" : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
}