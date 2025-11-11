import { create } from 'zustand';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
    message: string;
    severity: Severity;
    showMessage: (message: string) => void;
    open: boolean;
    closeMessage: () => void;
}

export const useSnackbarStore = create<SnackbarState>()(
    (set) => ({
        message: '',
        severity: 'info',
        open: false,
        showMessage: (message: string) => set({ message, open: true }),
        closeMessage: () => set({ open: false })
    })
);