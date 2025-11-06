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

    const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
    const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);


    const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
        setImportResults(results)
        setVariant(VARIANTS.IMPORT)
    }

    const onCancelImport = () => {
        console.log("onCancelImport called, resetting variant to LIST");
        setImportResults(INITIAL_IMPORT_RESULTS);
        setVariant(VARIANTS.LIST)
    }

    const newTransaction = useNewATransaction();
    const transactionsQuery = useGetTransactions();
    const deleteTransactions = useBulkDeleteTransactions();

    const isDisabled = transactionsQuery.isLoading || deleteTransactions.isPending
    const transactions = transactionsQuery.data || []

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
                <ImportCard
                    data={importResults.data}
                    onCancel={onCancelImport}
                    onSubmit={() => {}}
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