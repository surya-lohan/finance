
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import {  clerkMiddleware, getAuth } from "@hono/clerk-auth";

const app = new Hono().get("/", 
    clerkMiddleware(),
    async (c) => {
        const auth = getAuth(c);

        if (!auth?.isAuthenticated) {
            return c.json({
                error: "Unauthorized"
            }, 401)
        }

        const data = await prisma.accounts.findFirst({
            select: {
                id: true,
                name: true,
            },
            where: {
                userId: auth.userId
            }
    });
    return c.json({
        accounts: data,
    });
});

export default app;