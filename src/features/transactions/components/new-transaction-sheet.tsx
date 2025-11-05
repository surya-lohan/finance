import { z } from "zod/v4"

import { useCreateTransaction } from "../hooks/use-create-transaction"
import { useNewATransaction } from "../hooks/use-new-transaction"
import { useCreateCategory } from "@/features/categories/hooks/use-create-category"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"

import {
    Sheet,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"

import { TransactionForm } from "./transaction-form"
import { transactionSchema } from "../../../../prisma/transactionSchema"
import { useCreateAccount } from "@/features/accounts/hooks/use-create-account"
import { Loader2 } from "lucide-react"

const formSchema = transactionSchema.omit({
    id: true
})

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {

    const { isOpen, onClose } = useNewATransaction()

    const createMutation = useCreateTransaction();

    const categoryMutation = useCreateCategory();
    const categoryQuery = useGetCategories();

    const accountQuery = useGetAccounts();
    const accountMutation = useCreateAccount();

    const onCreateCategory = (name: string) => {
        categoryMutation.mutate({
            name
        })
    }

    const onCreateAccount = (name: string) => {
        accountMutation.mutate({
            name
        })
    }

    const onSubmit = (values: FormValues) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const isPending =
        createMutation.isPending ||
        categoryMutation.isPending ||
        accountMutation.isPending

    const isLoading =
        categoryQuery.isLoading ||
        accountQuery.isLoading

    const categoryOptions = (categoryQuery.data ?? []).map(category => ({
        label: category.name,
        value: category.id
    }))

    const accountOptions = (accountQuery.data ?? []).map(account => ({
        label: account.name,
        value: account.id
    }))

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="p-4">
                <SheetHeader>
                    <SheetTitle>
                        New Transaction
                    </SheetTitle>
                    <SheetDescription>
                        Create a new transaction
                    </SheetDescription>
                </SheetHeader>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-4 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <TransactionForm
                        onSubmit={onSubmit}
                        disabled={isPending}
                        categoryOptions={categoryOptions}
                        onCreateCategory={onCreateCategory}
                        accountOptions={accountOptions}
                        onCreateAccount={onCreateAccount}
                    />
                )}

            </SheetContent>
        </Sheet>
    )
}