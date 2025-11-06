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
import { useNewAccount } from "../../../features/accounts/hooks/use-new-account";

import { columns } from "./columns"
import { DataTable } from "./data-table";
import { useGetAccounts } from "../../../features/accounts/api/use-get-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteAccounts } from "../../../features/accounts/hooks/use-bulk-delete-accounts";



const Accounts = () => {

    const newAccount = useNewAccount();
    const accountsQuery = useGetAccounts();
    const deleteAccounts = useBulkDeleteAccounts();

    const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending
    const accounts = accountsQuery.data || []

    if (accountsQuery.isLoading) {
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
                        Accounts Page
                    </CardTitle>
                    <Button onClick={newAccount.onOpen} size="sm">
                        <Plus />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent >
                    <DataTable
                        disabled={isDisabled}
                        filterKey="name"
                        columns={columns as unknown as ColumnDef<{ name: string; id: string }, unknown>[]}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id);
                            deleteAccounts.mutate({
                                json: { ids }
                            });
                        }}
                        data={accounts} />
                </CardContent>
            </Card>
        </div>
    );
}

export default Accounts;