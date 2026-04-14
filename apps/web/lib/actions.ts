// lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Action to submit a new RACA request
 */
export async function submitRacaRequest(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const data = {
    purpose: formData.get("purpose"),
    roomName: formData.get("roomName"),
    items: formData.get("items"),
    startTime: new Date(formData.get("startTime") as string).toISOString(),
    endTime: new Date(formData.get("endTime") as string).toISOString(),
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorDetail = await res.json();
      console.error("Backend Error Detail:", errorDetail);
      return { error: errorDetail.message || "Unauthorized by STI Backend" };
    }

    revalidatePath("/dashboard/raca");
    return { success: true };
  } catch (err) {
    console.error("Action Error:", err);
    return { error: "Could not send request. Check backend connection." };
  }
}

/**
 * Action for Admins and Heads to update request status (Approve/Deny)
 */
export async function updateRacaStatus(
  racaId: string,
  newStatus: "APPROVED" | "DENIED" | "PENDING"
) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/${racaId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookieHeader,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    if (!res.ok) {
      const errorDetail = await res.json();
      console.error("Status Update Error:", errorDetail);
      return { error: errorDetail.message || "Failed to update status" };
    }

    // This triggers the server-side cache refresh so the UI updates for all users
    revalidatePath("/dashboard/raca");
    // If you have a separate approval page route, revalidate that too:
    revalidatePath("/dashboard/approval"); 

    return { success: true };
  } catch (err) {
    console.error("Connection Error:", err);
    return { error: "Connection to STI Backend failed." };
  }
}