import { z } from "zod/v4";

export const transactionSchema = z.object({
    id: z.string(),
    amount: z.number().int(),
    payee: z.string(),
    date: z.date(),
    accountId: z.string(),
    categoriesId: z.string().optional().nullable(),
});