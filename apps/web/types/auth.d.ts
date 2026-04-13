import { User as PrismaUser } from "@prisma/client";

declare module "better-auth" {
    interface User extends PrismaUser {}
}

declare module "better-auth/react" {
    interface User extends PrismaUser {}
}