import { create } from 'zustand';

interface PostSeenState {
    ids: Set<string>;
    reset: () => void;
}

export const usePostSeenStore = create<PostSeenState>()((set) => ({
    ids: new Set(),
    reset: () => set({ ids: new Set() }),
}));