import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string", 
                required: false,
                defaultValue: "STAFF",
            },
        },
    },
    // --- ADDED HOOK FOR AUTOMATIC ROLE ASSIGNMENT ---
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const email = user.email.toLowerCase();
                    let assignedRole = "STAFF";

                    // Logic based on your STI Cubao requirements
                    if (email.includes("_admin@")) {
                        assignedRole = "ADMIN";
                    } else if (email.includes("_head@")) {
                        assignedRole = "HEAD";
                    } else if (email.includes("_faculty@")) {
                        assignedRole = "FACULTY";
                    } else if (email.includes("_staff@")) {
                        assignedRole = "STAFF";
                    }

                    return {
                        data: {
                            ...user,
                            role: assignedRole,
                        },
                    };
                },
            },
        },
    },
});