"use client"

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Plus } from "lucide-react";
import { useNewAccount } from "../../../../features/accounts/hooks/use-new-account";

import { columns, Payment } from "./columns"
import { DataTable } from "./data-table";



const data: Payment[] = [
    {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
    },
]

const Accounts = () => {

    const newAccount = useNewAccount();

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm ">
                <CardHeader className="gap-y-2 lg:flex lg:items-center lg:justify-between ">
                    <CardTitle className="text-xl line-clamp-1 ">
                        Accounts
                    </CardTitle>
                    <Button onClick={newAccount.onOpen} size="sm">
                        <Plus />
                        Add New
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        disabled={false}
                        filterKey="email"
                        columns={columns}
                        onDelete={() => {}}
                        data={data} />
                </CardContent>
            </Card>
        </div>
    );
}

export default Accounts;