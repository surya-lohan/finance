import { create } from "zustand"

type NewATransactionState = {
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void
}

export const useNewATransaction = create<NewATransactionState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}))