import {z} from "zod/v4"
import {
    Sheet,
    SheetDescription,
    SheetHeader,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"
import { CategoryForm } from "./category-form"
import { useCreateCategory } from "../hooks/use-create-category"
import { useNewCategory } from "../hooks/use-new-category"

const formSchema = z.object({
    name: z.string()
})

type FormValues = z.input<typeof formSchema>;

export const NewCategorySheet = () => {

    const {isOpen , onClose} = useNewCategory()

    const mutation = useCreateCategory();

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values , {
            onSuccess: () => {
                onClose()
            }
        })
    }


    return (
        <Sheet open={isOpen} onOpenChange={onClose}> 
            <SheetContent className="p-4">
                <SheetHeader>
                    <SheetTitle>
                        New Category
                    </SheetTitle>
                    <SheetDescription>
                        Create a new category to track your transactions
                    </SheetDescription>
                </SheetHeader>
                <CategoryForm onSubmit={onSubmit} disabled={mutation.isPending} defaultValues={{name: ""}} />
            </SheetContent>
        </Sheet>
    )
}