import { unknown, z } from "zod/v4"
import {
    Sheet,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"
import { TransactionForm } from "./transaction-form"
import { useCreateTransaction } from "../hooks/use-create-transaction"
import { useOpenTransaction } from "../hooks/use-open-transaction"
import { useGetTransaction } from "../api/use-get-transaction"
import { Loader2 } from "lucide-react"
import { useEditTransaction } from "../hooks/use-edit-transaction"
import { useDeleteTransaction } from "../hooks/use-delete-transaction"
import { useConfirm } from "@/hooks/use-confirm"
import { transactionSchema } from "@/app/api/[[...route]]/transactions"

const formSchema = transactionSchema.omit({
    id: true
})

type FormValues = z.input<typeof formSchema>;

export const EditTransactionSheet = () => {

    const { isOpen, onClose, id } = useOpenTransaction()

    const accountQuery = useGetTransaction(id);
    const editMutation = useEditTransaction(id);
    const deleteMutation = useDeleteTransaction(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;
    const isLoading = accountQuery.isLoading;

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this account"
    )

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const defaultValues = accountQuery.data ? {
        account: accountQuery.data.account.name
    } : {
        name: ""
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

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="p-4">
                    <SheetHeader>
                        <SheetTitle>
                            Edit account
                        </SheetTitle>
                        <SheetDescription>
                            Edit an exsiting account
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
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}