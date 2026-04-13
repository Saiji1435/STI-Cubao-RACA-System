// apps/web/hooks/use-auth.ts
import { authClient } from "../lib/auth-client"; // Your Better Auth client
import { Role } from "@prisma/client";

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  const user = session?.user;

  // Check if the user has administrative privileges
  // This helps show/hide UI elements before the backend guard even kicks in
  const isPrivileged = user?.role === "ADMIN" || user?.role === "HEAD";
  const isHead = user?.role === "HEAD";
  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    session,
    isPending,
    error,
    isPrivileged,
    isHead,
    isAdmin,
    isAuthenticated: !!session,
  };
}