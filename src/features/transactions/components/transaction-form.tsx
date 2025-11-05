import { z } from "zod/v4";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"

import { transactionSchema } from "../../../../prisma/transactionSchema";
import { DatePicker } from "@/components/date-picker";
import { AmountInput } from "@/components/amount";
import { convertAmountToMiliUnits } from "@/lib/utils";


const formSchema = z.object({
    date: z.date(),
    accountId: z.string(),
    categoriesId: z.string().nullable().optional(),
    payee: z.string(),
    amount: z.string(),
    notes: z.string().nullable().optional()
})

const apiSchema = transactionSchema.omit({
    id: true
})

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>

type Props = {
    id?: string,
    defaultValues?: FormValues,
    onSubmit: (values: ApiFormValues) => void
    onDelete?: () => void,
    disabled?: boolean,
    accountOptions: { label: string; value: string }[]
    categoryOptions: { label: string; value: string }[]
    onCreateAccount: (name: string) => void
    onCreateCategory: (name: string) => void
}

export const TransactionForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    categoryOptions,
    accountOptions,
    onCreateAccount,
    onCreateCategory
}: Props) => {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    });

    // useEffect(() => {
    //     if (defaultValues) {
    //         form.reset(defaultValues);
    //     }
    // }, [defaultValues, form]);

    const handleSubmit = (values: FormValues) => {
        const amount = parseFloat(values.amount)
        const amountInMiliUnits = convertAmountToMiliUnits(amount);
        onSubmit({
            ...values,
            amount: amountInMiliUnits
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

    return (
        <Form {...form} >
            <form
                className="space-y-4 pt-4"
                onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField name="date" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <DatePicker
                                value={field.value instanceof Date ? field.value : undefined}
                                onChange={(date) => {
                                    field.onChange(date);
                                    return date;
                                }}
                                disabled={disabled}
                            />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField name="accountId" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Transaction
                        </FormLabel>
                        <FormControl>
                            <Select
                                placeholder="Select account"
                                options={accountOptions}
                                onCreate={onCreateAccount}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={disabled}
                            />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField name="categoriesId" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Category
                        </FormLabel>
                        <FormControl>
                            <Select
                                placeholder="Select a category"
                                options={categoryOptions}
                                onCreate={onCreateCategory}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={disabled}
                            />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField name="payee" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Payee
                        </FormLabel>
                        <FormControl>
                            <Input
                                disabled={disabled}
                                placeholder="Add a payee"
                                {...field}
                                value={field.value || ""}
                            />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField name="amount" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Amount
                        </FormLabel>
                        <FormControl>
                            <AmountInput
                                {...field}
                                disabled={disabled}
                                placeholder="0.00"
                            />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField name="notes" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Notes
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                value={field.value || ""}
                                disabled={disabled}
                                placeholder="Optional notes"
                            />
                        </FormControl>
                    </FormItem>
                )} />

                <Button type="submit" disabled={disabled}>
                    {id ? "Save changes" : "Create transaction"}
                </Button>
                {!!id && <Button
                    type="button"
                    disabled={disabled}
                    onClick={handleDelete}
                    className="w-full"
                    variant="outline"
                >
                    <Trash className="size-4 mr-2" />
                    Delete Transaction
                </Button>}
            </form>
        </Form>
    )
}