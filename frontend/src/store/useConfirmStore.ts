// stores/useConfirmStore.ts
import { create } from 'zustand';

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
    confirm: (param?: ConfirmOptions | string) => Promise<boolean>;
    onConfirm: () => void;
    onCancel: () => void;
};

export const useConfirmStore = create<ConfirmState>()((set, get) => ({
    open: false,
    title: "",
    message: null,
    confirmText: "OK",
    cancelText: "Cancel",
    resolve: null,

    confirm: (param) => {
        return new Promise<boolean>((resolve) => {
            const defaultParams = {
                open: true,
                title: 'Confirm',
                message: '',
                confirmText: 'OK',
                cancelText: 'Cancel'
            };

            if (typeof param == 'object')
                set({ ...defaultParams, ...param, resolve });
            else
                set({ ...defaultParams, message: param, resolve });
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
