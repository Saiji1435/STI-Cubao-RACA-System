"use client";

import { useSession } from "../../lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";

export default function OverviewPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name}.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending RACAs</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items Filed</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Card */}
      <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Need to file a new activity?</h3>
        <p className="text-muted-foreground mb-6">Head over to the RACA Filing section to submit your request and digital signature.</p>
        <Link href="/dashboard/raca">
          <Button size="lg">Go to RACA Filing</Button>
        </Link>
      </div>
    </div>
  );
}