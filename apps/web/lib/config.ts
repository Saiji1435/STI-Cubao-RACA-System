// lib/config.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// STI Cubao Signatory Roles
export const SIGNATORY_ROLES = [
  "ADMIN_MIS", 
  "ADMIN_DSA", 
  "HEAD_SA", 
  "HEAD_ACADEMIC", 
  "ADMIN_BUILDING", 
  "HEAD_DEPT", 
  "ADMIN_MAIN"
];

export const isAuthorized = (role?: string) => {
  if (!role) return false;
  return role.startsWith("ADMIN") || role.startsWith("HEAD") || SIGNATORY_ROLES.includes(role);
};