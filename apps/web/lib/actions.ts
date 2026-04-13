// lib/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // Import cookies to access the session

export async function submitRacaRequest(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  // Get all cookies to forward to the backend
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
        // FORWARD THE COOKIES HERE
        "Cookie": cookieHeader 
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