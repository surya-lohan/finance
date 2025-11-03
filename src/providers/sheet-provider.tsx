"use client"

import { NewAccountSheet } from "../features/accounts/components/new-account-sheet"
import { EditAccountSheet } from "../features/accounts/components/edit-account-sheet"

import { NewCategorySheet } from "@/features/categories/components/new-account-sheet"
import { EditCategorySheet } from "@/features/categories/components/edit-account-sheet"


export const SheetProvider = () => {
    return (
        <>
            <NewAccountSheet />
            <EditAccountSheet />

            <NewCategorySheet />
            <EditCategorySheet />
        </>
    )
}