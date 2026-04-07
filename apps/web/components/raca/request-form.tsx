"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const formSchema = z.object({
  purpose: z.string().min(5),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export function RequestForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField control={form.control} name="purpose" render={({ field }) => (
          <FormItem>
            <FormLabel>Event Purpose</FormLabel>
            <FormControl><Input placeholder="e.g. Faculty Meeting" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                </FormItem>
            )} />
            <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                </FormItem>
            )} />
        </div>
        <Button className="w-full bg-blue-900">Submit Request</Button>
      </form>
    </Form>
  );
}