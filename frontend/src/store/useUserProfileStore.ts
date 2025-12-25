import { apiGet } from "@/api/apiClient";
import type { UserId } from "@shared/models/generated/User";
import type { UserProfile } from "@shared/models/generated/UserProfile";
import { create } from "zustand";

interface StoreState {
    userProfile: UserProfile | null;
    fetchProfile: (id: UserId) => void;
}

export const useUserProfileStore = create<StoreState>()((set, get) => ({
    userProfile: null,
    fetchProfile: async (id: UserId) => {
        const result = await apiGet<UserProfile>(`/profile/${id}`);
        if (result.ok && result.data) {
            set({ userProfile: result.data });
        }
    }
}));