"use client"

import { InferResponseType } from "hono"
import { client } from "@/lib/hono";

import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { ArrowUpDown } from "lucide-react"
import Actions from "./actions";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { format } from "date-fns";

export type ResponseType = InferResponseType<typeof client.api.transactions.$get, 200>["transactions"][number]

export const columns: ColumnDef<ResponseType>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {

            const date = row.getValue("date") as Date;



            return (
                <span>
                    {format(date, "dd MMMM, yyyy")}
                </span>
            )
        }
    },

    {
        accessorKey: "payee",
        header: "Payee"
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ((cell) => {
            const amount = convertAmountFromMiliUnits(cell.row.original.amount)
            return `$${amount}`
        })
    },
    {
        accessorKey: "categories",
        header: "Category",
        cell: ((cell) => {
            const category = cell.row.original.categories;
            return category?.name || "-"
        })
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }
]