
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { date, gte, string, z } from "zod/v4";
import { createId } from "@paralleldrive/cuid2"
import { error } from "console";
import { subDays, parse } from "date-fns"

const app = new Hono()
    .get("/",

        zValidator("query", z.object({
            from: z.string(),
            to: z.string(),
            accountId: z.string().optional()
        })),

        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId } = c.req.valid("query");
            if (!auth?.isAuthenticated) {
                return c.json({
                    error: "Unauthorized"
                }, 401)
            }

            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30)

            const startDate = from ? parse(from, "yyy-MM-dd", new Date()) : defaultFrom;
            const endDate = to ? parse(to, "yyy-MM-dd", new Date()) : defaultTo;

            const data = await prisma.transactions.findMany({
                include: {
                    account: true,
                    categories: true
                },
                where: {
                    account: {
                        userId: auth.userId
                    },
                    id: accountId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                },
                orderBy: {
                    date: 'desc'
                }
            })

            return c.json({
                transactions: data,
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

            const [transactions] = await prisma.transactions.findMany({
                where: {
                    account: {
                        userId: auth.userId
                    },
                    id: id
                },
                include: {
                    account: true,
                    categories: true
                }
            })

            if (!transactions) {
                return c.json({ error: "Not found" }, 404)
            }
            return c.json(transactions)
        }
    )
    .post("/",
        clerkMiddleware(),

        zValidator("json", z.object({
            amount: z.number(),
            payee: z.string(),
            accountId: z.string(),
        })),

        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({
                    error: "Unauthorized"
                }, 401)
            }

            const data = await prisma.transactions.create({
                data: {
                    id: createId(),
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

            

            const data = await prisma.transactions.deleteMany({
                where: {
                    account: {
                        userId: auth.userId
                    },
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
            amount: z.number().optional(),
            date: z.date().optional(),
            payee: z.string().optional(),
        })),

        async (c) => {
            const auth = getAuth(c);

            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({ error: "Missing Id" }, 400)
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorised" }, 401)
            }

            const data = await prisma.transactions.update({
                data: {
                    amount: values.amount,
                    payee: values.payee,
                    date: values.date
                },
                where: {
                    id: id,
                    account: {
                        userId: auth.userId
                    }
                },
                select: {
                    id: true,
                    date: true,
                    amount: true,
                    payee: true
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
                return c.json({ error: "Missing Id" }, 400)
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorised" }, 401)
            }

            const data = await prisma.transactions.delete({
                where: {
                    id: id,
                    account: {
                    userId: auth.userId
                    }
                },
                select: {
                    id: true,
                    amount: true,
                    payee: true,
                    date: true
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