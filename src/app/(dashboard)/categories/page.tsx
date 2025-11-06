"use client"

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { columns } from "./columns"
import { DataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useBulkDeleteCategories } from "@/features/categories/hooks/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";


const Accounts = () => {

    const newCategory = useNewCategory();
    const categoriesQuery = useGetCategories();
    const deleteCategories = useBulkDeleteCategories();

    const isDisabled =  categoriesQuery.isLoading || deleteCategories.isPending
    const categories = categoriesQuery.data || []

    if (categoriesQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl  mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-sm ">
                    <CardHeader>
                        <Skeleton className="h-8 w-48 " />
                    </CardHeader>
                    <CardContent >
                        <div className="h-[500px] w-full flex items-center justify-center" >
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm ">
                <CardHeader className="gap-y-2 lg:flex lg:items-center lg:justify-between ">
                    <CardTitle className="text-xl line-clamp-1 ">
                        Categories
                    </CardTitle>
                    <Button onClick={newCategory.onOpen} size="sm">
                        <Plus />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent >
                    <DataTable<{ name: string; id: string }, unknown>
                        disabled={isDisabled}
                        filterKey="name"
                        columns={columns as unknown as ColumnDef<{ name: string; id: string }, unknown>[]}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id);
                            deleteCategories.mutate({
                                json: { ids }
                            });
                        }}
                        data={categories} />
                </CardContent>
            </Card>
        </div>
    );
}

export default Accounts;