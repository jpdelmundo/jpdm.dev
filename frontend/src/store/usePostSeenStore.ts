import { create } from 'zustand';

interface PostSeenState {
    ids: Set<string>;
}

export const usePostSeenStore = create<PostSeenState>()(() => ({
    ids: new Set()
}));