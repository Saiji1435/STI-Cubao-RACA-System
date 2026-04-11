"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "../../../lib/auth-client"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"; 
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

export default function RacaFilingPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [racas, setRacas] = useState<any[]>([]);
  const API_BASE = "http://10.2.103.35:3001";

  const fetchRacas = async () => {
    try {
      const response = await fetch(`${API_BASE}/raca`);
      const data = await response.json();
      const userRole = (session?.user as any)?.role; 
      
      if (userRole === "ADMIN" || userRole === "HEAD") {
        setRacas(data);
      } else {
        setRacas(data.filter((r: any) => r.requestorId === session?.user?.id));
      }
    } catch (error) {
      console.error("Failed to fetch RACAs", error);
    }
  };

  useEffect(() => {
    if (session) fetchRacas();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    if (session?.user?.id) formData.append("userId", session.user.id);

    try {
      const response = await fetch(`${API_BASE}/raca/upload-raca`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Submission failed");
      toast.success("RACA Submitted Successfully!");
      fetchRacas(); 
      (e.target as HTMLFormElement).reset(); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RACA Filing</h1>
        <p className="text-muted-foreground">Request Approval for Campus Activity/Venue</p>
      </div>

      <section className="max-w-2xl border p-6 rounded-lg bg-card shadow-sm">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">New Request Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          {/* ... all your form inputs (Nature, Objectives, Dates, Signature) ... */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit for Approval"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Tracking Table</h2>
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racas.map((raca) => (
                <TableRow key={raca.id}>
                  <TableCell>{raca.natureOfActivity}</TableCell>
                  <TableCell>
                    <Badge variant={raca.status === "APPROVED" ? "default" : "secondary"}>
                      {raca.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {raca.status === "APPROVED" && raca.filePath && (
                      <Button size="sm" onClick={() => window.open(`${API_BASE}${raca.filePath}`, '_blank')}>
                        Download PDF
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}