
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { string, z } from "zod/v4";
import { createId } from "@paralleldrive/cuid2"
import { error } from "console";

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

            const data = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true,
                },
                where: {
                    userId: auth.userId
                }
            });
            return c.json({
                categories: data,
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

            const [categories] = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true
                },
                where: {
                    userId: auth.userId,
                    id: id
                }
            })

            if (!categories) {
                return c.json({ error: "Not found" }, 404)
            }
            return c.json(categories)
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

            const data = await prisma.categories.create({
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

            const data = await prisma.categories.deleteMany({
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
    .patch("/:id",

        clerkMiddleware(),

        zValidator("param", z.object({
            id: z.string().optional()
        })),

        zValidator("json", z.object({
            name: z.string()
        })),

        async (c) => {
            const auth = getAuth(c);

            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({error: "Missing Id"}, 400)
            }

            if (!auth?.userId) {
                return c.json({error: "Unauthorised" }, 401)
            }

            const data = await prisma.categories.update({
                data: {
                    name: values.name
                },
                where: {
                    id: id,
                    userId: auth.userId
                },
                select: {
                    name: true,
                    id: true
                }
            })

            if (!data) {
                return c.json({
                    error: "Oops! Account not found"
                }, 404)
            }

            return c.json(data)
        }
    )
    .delete("/:id",

        clerkMiddleware(),

        zValidator("param", z.object({
            id: z.string().optional()
        })),

        async (c) => {
            const auth = getAuth(c);

            const { id } = c.req.valid("param");
            
            if (!id) {
                return c.json({error: "Missing Id"}, 400)
            }

            if (!auth?.userId) {
                return c.json({error: "Unauthorised" }, 401)
            }

            const data = await prisma.categories.delete({
                where: {
                    id: id,
                    userId: auth.userId
                },
                select: {
                    name: true,
                    id: true
                }
            })

            if (!data) {
                return c.json({
                    error: "Oops! Account not found"
                }, 404)
            }

            return c.json(data)
        }
    )

export default app;