// apps/web/hooks/use-auth.ts
import { authClient } from "../lib/auth-client"; 
import { isAuthorized } from "../lib/config"; // Import your centralized logic

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  const user = session?.user;

  // Uses the centralized helper to check for Admin/Head status
  const isPrivileged = isAuthorized(user?.role);
  
  // Specific role checks using your system's naming convention
  const isSuperAdmin = user?.role === "ADMIN_MAIN";
  const isHead = user?.role?.includes("HEAD");

  return {
    user,
    session,
    isPending,
    error,
    isPrivileged, // Use this for showing Inventory/Room buttons
    isSuperAdmin,
    isHead,
    isAuthenticated: !!session,
  };
}