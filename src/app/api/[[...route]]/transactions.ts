
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { createId } from "@paralleldrive/cuid2"
import { subDays, parse } from "date-fns"
import { transactionSchema } from "../../../../prisma/transactionSchema";



const app = new Hono()
    .get("/",

        zValidator("query", z.object({
            from: z.string(),
            to: z.string(),
            accountId: z.string().optional()
        })),

        clerkMiddleware(),
        async (c) => {

            try {
                const auth = getAuth(c);
                const { from, to, accountId } = c.req.valid("query");

                if (!auth?.isAuthenticated) {
                    return c.json({
                        error: "Unauthorized"
                    }, 401)
                }

                const defaultTo = new Date();
                const defaultFrom = subDays(defaultTo, 30)

                let startDate = defaultFrom;
                let endDate = defaultTo;

                // Only parse dates if they are provided and not empty
                try {
                    if (from && from.trim()) {
                        startDate = parse(from, "yyyy-MM-dd", new Date());
                    }
                    if (to && to.trim()) {
                        endDate = parse(to, "yyyy-MM-dd", new Date());
                    }
                } catch (parseError) {
                    console.error("Date parse error:", parseError);
                    return c.json({
                        error: "Invalid date format. Use yyyy-MM-dd"
                    }, 400)
                }

                const data = await prisma.transactions.findMany({
                    where: {
                        account: {
                            userId: auth.userId
                        },
                        ...(accountId && accountId.trim() && { accountId }),
                        date: {
                            gte: startDate,
                            lte: endDate
                        },
                    },
                    orderBy: {
                        date: 'desc'
                    },
                    include: {
                        categories: true,
                        account: true
                    }
                })

                return c.json({
                    transactions: data,
                });
            } catch (error) {
                console.error("Transactions API error:", error);
                return c.json({
                    error: "Internal server error",
                    details: error instanceof Error ? error.message : "Unknown error"
                }, 500)
            }
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

            const transactions = await prisma.transactions.findMany({
                select: {
                    id: true,
                    account: true,
                    categories: true,
                    amount: true,
                    payee: true,
                    accountId: true,
                    date: true
                },
                where: {
                    account: {
                        userId: auth.userId
                    },
                    id: id
                }
            })

            if (!transactions || transactions.length === 0) {
                return c.json({ error: "Not found" }, 404)
            }
            return c.json(transactions[0])
        }
    )
    .post("/",
        clerkMiddleware(),

        zValidator("json", z.object({
            amount: z.number(),
            payee: z.string(),
            accountId: z.string(),
            date: z.string().or(z.date()).optional(),
            categoriesId: z.string().optional().nullable()
        })),

        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({
                    error: "Unauthorized"
                }, 401)
            }

            const dateValue = values.date
                ? (typeof values.date === 'string' ? new Date(values.date) : values.date)
                : new Date();

            const data = await prisma.transactions.create({
                data: {
                    id: createId(),
                    amount: values.amount,
                    payee: values.payee,
                    accountId: values.accountId,
                    date: dateValue,
                    ...(values.categoriesId && { categoriesId: values.categoriesId }),
                },
                include: {
                    categories: true,
                    account: true
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
    .post("/bulk-create",
        clerkMiddleware(),
        zValidator("json", z.array(transactionSchema.omit({
            id: true
        }))
        ),
        async (c) => {
            const auth = getAuth(c);

            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({
                    error: "Unauthorised"
                }, 401)
            }

            const data = await prisma.transactions.createMany({
                data: values.map(transaction => ({
                    ...transaction,
                    id: createId()
                }))
            })

            return c.json(data);

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