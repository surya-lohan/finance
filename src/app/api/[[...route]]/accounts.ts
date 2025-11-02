
    import { Hono } from "hono";
    import { prisma } from "@/lib/prisma";
    import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
    import { zValidator } from "@hono/zod-validator";
    import { z } from "zod/v4";
    import { createId } from "@paralleldrive/cuid2"

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
        })
        .post("/",
            clerkMiddleware(),
            
            zValidator("json", z.object({
                id: z.string().optional(),
                name: z.string(),
                userId: z.string().optional(),
                plaidId: z.string().optional()
            })),

            async (c) => {
                const auth = getAuth(c);
                const values = c.req.valid("json");

                if (!auth?.userId) {
                    return c.json({
                        error: "Unauthorized"
                    }, 401)
                }

                const data = await prisma.accounts.create({
                    data: {
                        id: createId(),
                        userId: auth.userId,
                        ...values
                    }
                })
                return c.json({ data })
            })

    export default app;