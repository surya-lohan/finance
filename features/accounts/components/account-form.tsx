import {z} from "zod/v4";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"

const formSchema = z.object({
    name: z.string()
})

type FormValues = z.input<typeof formSchema>;

type Props = {
    id?: string,
    defaultValues?: FormValues,
    onSubmit: (values: FormValues) => void
    onDelete?: () => void,
    disabled?: boolean
}

export const AccountForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled
}: Props) => {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    });

    const handleSubmit = (values: FormValues) => {
        onSubmit(values)
    }

    const handleDelete = () => {
        onDelete?.()
    }

    return (
        <Form {...form} >
            <form 
                className="space-y-4 pt-4"
                onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField name="name" control={form.control} render={({field}) => (
                        <FormItem>
                            <FormLabel>
                                Name
                            </FormLabel>
                            <FormControl>
                                <Input 
                                    disabled={disabled} 
                                    placeholder="e.g. Cash, Bank, Credit Card"
                                    {...field}
                                /> 
                            </FormControl>
                        </FormItem>
                    )} />
                    <Button>
                        {id ? "Save changes" : "Create account"}
                    </Button>
                    { !!id && <Button
                        type="button"
                        disabled={disabled}
                        onClick={handleDelete}
                        className="w-full"
                        variant="outline"
                    >
                        <Trash className="size-4 mr-2"  />
                        Delete Account
                    </Button>}
            </form>
        </Form>
    )
}