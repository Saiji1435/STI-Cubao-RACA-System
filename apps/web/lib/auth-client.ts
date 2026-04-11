import { createAuthClient } from "better-auth/react";

// 1. Help TS by defining the config as a constant
const authConfig = {
    baseURL: "http://10.2.103.35:3001",
    user: {
        additionalFields: {
            role: {
                type: "string",
            },
        },
    },
} as const;

// 2. Explicitly type the client to resolve the 'Portable' error
export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(authConfig);

// 3. Export hooks individually with explicit types
export const useSession: typeof authClient.useSession = authClient.useSession;
export const signIn: typeof authClient.signIn = authClient.signIn;
export const signUp: typeof authClient.signUp = authClient.signUp;
export const signOut: typeof authClient.signOut = authClient.signOut;