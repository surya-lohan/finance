import { z } from "zod/v4"
import {
    Sheet,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"
import { AccountForm } from "./account-form"
import { useCreateAccount } from "../hooks/use-create-account"
import { useOpenAccount } from "../hooks/use-open-account"
import { useGetAccount } from "../api/use-get-account"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string()
})

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {

    const { isOpen, onClose, id } = useOpenAccount()

    const accountQuery = useGetAccount(id);
    const mutation = useCreateAccount();

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const defaultValues = accountQuery.data ? {
        name: accountQuery.data.name
    } : {
        name: ""
    }
    const isLoading = accountQuery.isLoading;
    console.log(isLoading);
    return (
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
                    <AccountForm id={id} onSubmit={onSubmit} disabled={mutation.isPending} defaultValues={defaultValues} />
                )}
            </SheetContent>
        </Sheet>
    )
}