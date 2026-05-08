import { useAuthStore } from './useAuthStore';
import { useUserProfileStore } from './useUserProfileStore';
import { usePostSeenStore } from './usePostSeenStore';
import { useSnackbarStore } from './useSnackbarStore';
import { useConfirmStore } from './useConfirmStore';

export function resetAllStores() {
    useAuthStore.getState().clearToken();
    useUserProfileStore.getState().reset();
    usePostSeenStore.getState().reset();
    useSnackbarStore.getState().reset();
    useConfirmStore.getState().reset();
}
