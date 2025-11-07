"use client"

import type { ColumnDef } from "@tanstack/react-table";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useNewATransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useBulkDeleteTransactions } from "@/features/transactions/hooks/use-bulk-delete-transactions copy";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useState } from "react";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { transactionSchema } from "../../../../prisma/transactionSchema";
import { useSelectAccounts } from "@/features/accounts/hooks/use-select-account";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/features/transactions/hooks/use-bulk-create-transactions";

enum VARIANTS {
    LIST = "LIST",
    IMPORT = "IMPORT"
}

const INITIAL_IMPORT_RESULTS = {
    data: [],
    errors: [],
    meta: {}
}



const Transactions = () => {

    const [AccountDialog, confirm] = useSelectAccounts();

    const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
    const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);


    const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
        setImportResults(results)
        setVariant(VARIANTS.IMPORT)
    }

    const onCancelImport = () => {
        setImportResults(INITIAL_IMPORT_RESULTS);
        setVariant(VARIANTS.LIST)
    }

    const newTransaction = useNewATransaction();
    const createTransactions = useBulkCreateTransactions();
    const transactionsQuery = useGetTransactions();
    const deleteTransactions = useBulkDeleteTransactions();

    const isDisabled = transactionsQuery.isLoading || deleteTransactions.isPending
    const transactions = transactionsQuery.data || []

    const onSubmitImport = async (
        values: any[]
    ) => {
        const accountId = await confirm();

        if (!accountId) {
            return toast.error("Please select an account to continue.")
        }

        const data = values.map((value) => {

            return {
                payee: value.payee,
                amount: value.amount,
                date: value.date,
                accountId: accountId as string,
                categoriesId: value.categoriesId || null,
                notes: value.notes || null
            };
        });

        createTransactions.mutate({ json: data }, {
            onSuccess: () => {
                onCancelImport();
            }
        })
    }

    if (transactionsQuery.isLoading) {
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

    if (variant === VARIANTS.IMPORT) {
        return (
            <>
                <AccountDialog />
                <ImportCard
                    data={importResults.data}
                    onCancel={onCancelImport}
                    onSubmit={onSubmitImport}
                />
            </>
        )
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm ">
                <CardHeader className="gap-y-2 lg:flex lg:items-center lg:justify-between ">
                    <CardTitle className="text-xl line-clamp-1 ">
                        Transaction History
                    </CardTitle>
                    <div className="flex items-center gap-x-2">
                        <Button onClick={newTransaction.onOpen} size="sm">
                            <Plus />
                            Add New
                        </Button>
                        <UploadButton onUpload={onUpload} />
                    </div>
                </CardHeader>
                <CardContent >
                    <DataTable
                        disabled={isDisabled}
                        filterKey="payee"
                        columns={columns}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id);
                            deleteTransactions.mutate({
                                json: { ids }
                            });
                        }}
                        data={transactions}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default Transactions;