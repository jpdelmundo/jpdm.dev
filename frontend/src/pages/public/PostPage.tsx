import { apiGet } from '@/api/apiClient';
import { Post } from '@/components/Post';
import { PostSkeleton } from '@/components/skeleton/PostSkeleton';
import { useAuthStore } from '@/store/useAuthStore';
import Box from '@mui/material/Box';
import type PostDTO from '@shared/models/extensions/PostExtended';
import { ErrorCode } from '@shared/types/ErrorCode';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export function PostPage() {
    const ready = useAuthStore(s => s.ready);
    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState<PostDTO | null>(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const getData = async () => {
        // try {
        //     setIsLoading(true);
        //     const result = await apiGet<PostDTO>(`/posts/${id}`);
        //     if (result.ok && result.data) {
        //         setPost(result.data);
        //     }
        // } catch (error) {
        //     console.log('error caught');
        //     return <Error error={error} />
        // } finally {
        //     setIsLoading(false);
        // }

        setIsLoading(true);
        const result = await apiGet<PostDTO>(`/posts/${id}`);
        setIsLoading(false);
        if (result.ok && result.data) {
            setPost(result.data);
        } else {
            if (result.error?.code == ErrorCode.NOT_FOUND) {
                navigate('/not-found');
            } else {
                navigate('/error', { state: result });
            }
        }
    };

    useEffect(() => {
        ready && getData();
    }, [ready]);

    if (!id) return <Navigate to="/" replace />;

    return (<Box mt={1}>
        {
            !post || isLoading
                ? <PostSkeleton />
                : <Post post={post} />
        }
    </Box>)
}