import type { ReactNode } from 'react';
import { create } from 'zustand';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
    message: ReactNode | string;
    severity: Severity;
    showMessage: (message: ReactNode | string) => void;
    open: boolean;
    closeMessage: () => void;
}

export const useSnackbarStore = create<SnackbarState>()(
    (set) => ({
        message: '',
        severity: 'info',
        open: false,
        showMessage: (message: ReactNode | string) => set({ message, open: true }),
        closeMessage: () => set({ open: false })
    })
);