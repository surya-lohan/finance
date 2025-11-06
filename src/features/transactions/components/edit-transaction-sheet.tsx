import { unknown, z } from "zod/v4"
import {
    Sheet,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"
import { TransactionForm } from "./transaction-form"
import { useOpenTransaction } from "../hooks/use-open-transaction"
import { useEditTransaction } from "../hooks/use-edit-transaction"
import { useDeleteTransaction } from "../hooks/use-delete-transaction"
import { useGetTransaction } from "../api/use-get-transaction"
import { Loader2 } from "lucide-react"
import { useConfirm } from "@/hooks/use-confirm"
import { transactionSchema } from "../../../../prisma/transactionSchema"
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"
import { useCreateAccount } from "@/features/accounts/hooks/use-create-account"
import { useGetCategories } from "@/features/categories/api/use-get-categories"
import { useCreateCategory } from "@/features/categories/hooks/use-create-category"
import { useCreateTransaction } from "../hooks/use-create-transaction"
import { convertAmountFromMiliUnits } from "@/lib/utils"

const formSchema = transactionSchema.omit({
    id: true
})

type FormValues = z.input<typeof formSchema>;

export const EditTransactionSheet = () => {

    const { isOpen, onClose, id } = useOpenTransaction()

    const transactionQuery = useGetTransaction(id);
    const editMutation = useEditTransaction(id);
    const deleteMutation = useDeleteTransaction(id);

    const createMutation = useCreateTransaction();

    const categoryMutation = useCreateCategory();
    const categoryQuery = useGetCategories();

    const accountQuery = useGetAccounts();
    const accountMutation = useCreateAccount();



    const categoryOptions = (categoryQuery.data ?? []).map(category => ({
        label: category.name,
        value: category.id
    }))

    const accountOptions = (accountQuery.data ?? []).map(account => ({
        label: account.name,
        value: account.id
    }))

    const isPending = editMutation.isPending || deleteMutation.isPending || transactionQuery.isLoading || categoryMutation.isPending || accountMutation.isPending;
    const isLoading = transactionQuery.isLoading || categoryQuery.isLoading || accountQuery.isLoading;

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this transaction"
    )

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
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const onDelete = async () => {

        const ok = await confirm();

        if (ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        }

    }

    const defaultValues = transactionQuery.data ? {
        accountId: transactionQuery.data.accountId,
        categoryId: transactionQuery.data.categories?.id,
        amount: convertAmountFromMiliUnits(parseFloat(transactionQuery.data.amount.toString())).toString(),
        date: transactionQuery.data.date ? new Date(transactionQuery.data.date) : new Date(),
        payee: transactionQuery.data.payee,
        notes: transactionQuery.data.notes
    } : {
        accountId: "",
        categoryId: "",
        amount: "0",
        date: new Date(),
        payee: "",
        notes: "",
    }

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="p-4">
                    <SheetHeader>
                        <SheetTitle>
                            Edit transaction
                        </SheetTitle>
                        <SheetDescription>
                            Edit an exsiting transaction
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <TransactionForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            categoryOptions={categoryOptions}
                            onCreateCategory={onCreateCategory}
                            accountOptions={accountOptions}
                            onCreateAccount={onCreateAccount}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}