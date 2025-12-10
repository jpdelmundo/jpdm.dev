// stores/useConfirmStore.ts
import { create } from "zustand";

type ConfirmOptions = {
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
};

type ConfirmState = {
    open: boolean;
    title: string;
    message: React.ReactNode | null;
    confirmText: string;
    cancelText: string;
    resolve: ((v: boolean) => void) | null;
    confirm: (options?: ConfirmOptions) => Promise<boolean>;
    onConfirm: () => void;
    onCancel: () => void;
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
    open: false,
    title: "",
    message: null,
    confirmText: "OK",
    cancelText: "Cancel",
    resolve: null,

    confirm: (options) => {
        return new Promise<boolean>((resolve) => {
            set({
                open: true,
                title: options?.title ?? "Confirm",
                message: options?.message ?? "",
                confirmText: options?.confirmText ?? "OK",
                cancelText: options?.cancelText ?? "Cancel",
                resolve,
            });
        });
    },

    onConfirm: () => {
        get().resolve?.(true);
        set({ open: false, resolve: null });
    },

    onCancel: () => {
        get().resolve?.(false);
        set({ open: false, resolve: null });
    },
}));
