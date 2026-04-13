import { createAuthClient } from "better-auth/react";
import { User as PrismaUser } from "@prisma/client";

// 1. Explicitly define the Session shape to include your Prisma User
// This fixes the "Property 'role' does not exist" error
interface CustomSession {
    user: PrismaUser;
    session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null;
        userAgent?: string | null;
    };
}

// 2. Define the config as a plain object (remove 'as const' if it causes issues with the ReturnType)
const authConfig = {
    baseURL: "http://10.2.103.35:3001",
    user: {
        additionalFields: {
            role: {
                type: "string",
            },
        },
    },
};

// 3. FIX: Manually type the authClient. 
// We use 'any' for the internal complex types to bypass the "Portable" error 
// while keeping our external hooks strictly typed.
export const authClient: any = createAuthClient(authConfig);

// 4. Export hooks with explicit types
// This ensures your Schedules and Approvals pages see the 'role' field
export const useSession: () => { 
    data: CustomSession | null; 
    isPending: boolean; 
    error: any; 
    refetch: () => void 
} = authClient.useSession;

export const signIn: typeof authClient.signIn = authClient.signIn;
export const signUp: typeof authClient.signUp = authClient.signUp;
export const signOut: typeof authClient.signOut = authClient.signOut;