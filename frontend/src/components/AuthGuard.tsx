import { useAuthStore } from '@/store/useAuthStore';
import type { ReactNode } from 'react';
import { PageLoading } from './skeleton/PageLoading';

type Props = {
    children: ReactNode;
}

export const AuthGuard = ({ children }: Props) => {
    const ready = useAuthStore(s => s.ready);
    if (!ready) return <PageLoading />;

    return <>{children}</>;
}