
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { string, z } from "zod/v4";
import { createId } from "@paralleldrive/cuid2"

const app = new Hono()
    .get("/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.isAuthenticated) {
                return c.json({
                    error: "Unauthorized"
                }, 401)
            }

            const data = await prisma.accounts.findMany({
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
    .get("/:id",

        clerkMiddleware(),

        zValidator("param", z.object({
            id: z.string().optional()
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            console.log(id)
            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorised" }, 401);
            }

            const [account] = await prisma.accounts.findMany({
                select: {
                    id: true,
                    name: true
                },
                where: {
                    userId: auth.userId,
                    id: id
                }
            })

            if (!account) {
                return c.json({ error: "Not found" }, 404)
            }
            return c.json(account)
        }
    )
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
    .post("/bulk-delete",
        clerkMiddleware(),
        zValidator("json", z.object({
            ids: z.array(z.string())
        }))
        ,
        async (c) => {
            const auth = getAuth(c)
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorised" }, 401)
            }

            const data = await prisma.accounts.deleteMany({
                where: {
                    userId: auth.userId,

                    id: {
                        in: values.ids
                    }
                }
            })

            return c.json({
                data
            })
        }
    )

export default app;