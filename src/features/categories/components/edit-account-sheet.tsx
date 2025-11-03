import { unknown, z } from "zod/v4"
import {
    Sheet,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"
import { CategoryForm } from "./category-form"
import { useCreateCategory } from "../hooks/use-create-category"
import { useOpenCategory } from "../hooks/use-open-category"
import { Loader2 } from "lucide-react"
import { useEditCategory } from "../hooks/use-edit-category"
import { useDeleteCategory } from "../hooks/use-delete-category"
import { useConfirm } from "@/hooks/use-confirm"
import { useGetCategory } from "../api/use-get-category"
const formSchema = z.object({
    name: z.string()
})

type FormValues = z.input<typeof formSchema>;

export const EditCategorySheet = () => {

    const { isOpen, onClose, id } = useOpenCategory()

    const categoryQuery = useGetCategory(id)
    const editMutation = useEditCategory(id);
    const deleteMutation = useDeleteCategory(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;
    const isLoading = categoryQuery.isLoading;

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this category"
    )

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const defaultValues = categoryQuery.data ? {
        name: categoryQuery.data.name
    } : {
        name: ""
    }

    const onDelete = async () => {
        const ok = await confirm();

        if (ok) {
            deleteMutation.mutate( undefined ,{
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
                            Edit category
                        </SheetTitle>
                        <SheetDescription>
                            Edit an exsiting category
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <CategoryForm
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