import { prisma } from "@/lib/prisma";
import { calculatePercentageChage } from "@/lib/utils";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { subDays, parse, differenceInDays } from "date-fns";
import { Hono } from "hono";
import { Prisma } from "@/generated/prisma";
import z from "zod/v4";

type FinancialSummary = {
    income: number;
    expenses: number;
    remaining: number;
};

type CategoryData = {
    name: string;
    value: number;
};

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional()
        })),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId } = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 365);

            const startDate = from
                ? parse(from, "yyyy-MM-dd", new Date())
                : defaultFrom
            const endDate = to
                ? parse(to, "yyyy-MM-dd", new Date())
                : defaultTo;

            const periodLength = differenceInDays(endDate, startDate) + 1;
            const lastPeriodStart = subDays(startDate, periodLength)
            const lastPeriodEnd = subDays(endDate, periodLength);

            async function fetchFinancialData(
                userId: string,
                startDate: Date,
                endDate: Date,
                accountId?: string
            ) {
                const summary = await prisma.$queryRaw<FinancialSummary[]>(
                    Prisma.sql`
                        SELECT 
                            COALESCE(SUM(CASE WHEN t.amount >= 0 THEN t.amount ELSE 0 END), 0) as income,
                            COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as expenses, 
                            COALESCE(SUM(t.amount), 0) as remaining
                        FROM "Transactions" t
                        INNER JOIN "Accounts" a ON t."accountId" = a.id
                        WHERE a."userId" = ${userId}
                            ${accountId ? Prisma.sql`AND t."accountId" = ${accountId}` : Prisma.empty}
                            AND t.date >= ${startDate}
                            AND t.date <= ${endDate}
                    `
                );

                return summary[0] || { income: 0, expenses: 0, remaining: 0 };
            }

            async function fetchCategoriesData(
                userId: string,
                startDate: Date,
                endDate: Date,
                accountId?: string
            ) {
                const categories = await prisma.$queryRaw<CategoryData[]>(
                    Prisma.sql`
                        SELECT 
                            COALESCE(c.name, 'Uncategorized') as name,
                            SUM(ABS(t.amount)) as value
                        FROM "Transactions" t
                        INNER JOIN "Accounts" a ON t."accountId" = a.id
                        LEFT JOIN "Categories" c ON t."categoriesId" = c.id
                        WHERE a."userId" = ${userId}
                            ${accountId ? Prisma.sql`AND t."accountId" = ${accountId}` : Prisma.empty}
                            AND t.amount < 0
                            AND t.date >= ${startDate}
                            AND t.date <= ${endDate}
                        GROUP BY c.name
                        ORDER BY SUM(ABS(t.amount)) DESC
                    `
                );

                return categories;
            }


            const currentPeriod = await fetchFinancialData(
                auth.userId,
                startDate,
                endDate,
                accountId
            );
            const lastPeriod = await fetchFinancialData(
                auth.userId,
                lastPeriodStart,
                lastPeriodEnd,
                accountId
            );

            const categories = await fetchCategoriesData(
                auth.userId,
                startDate,
                endDate,
                accountId
            );

            console.log('Categories fetched:', categories);
            console.log('Date range:', { startDate, endDate });
            console.log('Current period expenses:', currentPeriod.expenses);

            const topCategories = categories.slice(0, 3).map(category => ({
                name: category.name,
                value: Number(category.value)
            }));
            const otherCategories = categories.slice(3);
            const otherSum = otherCategories.reduce((sum, current) => sum + Number(current.value), 0);

            const finalCategories = topCategories;
            if (otherCategories.length > 0) {
                finalCategories.push({
                    name: "Other",
                    value: otherSum
                });
            }

            const incomeChange = calculatePercentageChage(
                currentPeriod.income,
                lastPeriod.income
            )
            const expensesChange = calculatePercentageChage(
                currentPeriod.expenses,
                lastPeriod.expenses
            )
            const remainingChange = calculatePercentageChage(
                currentPeriod.remaining,
                lastPeriod.remaining
            )

            return c.json({
                currentPeriod: currentPeriod ? {
                    income: Number(currentPeriod.income),
                    expenses: Number(currentPeriod.expenses),
                    remaining: Number(currentPeriod.remaining),
                    incomeChange: Number(incomeChange),
                    expensesChange: Number(expensesChange),
                    remainingChange: Number(remainingChange)
                } : null,
                lastPeriod: lastPeriod ? {
                    income: Number(lastPeriod.income),
                    expenses: Number(lastPeriod.expenses),
                    remaining: Number(lastPeriod.remaining),
                    incomeChange: Number(incomeChange),
                    expensesChange: Number(expensesChange),
                    remainingChange: Number(remainingChange)
                } : null,
                finalCategories: finalCategories
            })
        }
    )

export default app;