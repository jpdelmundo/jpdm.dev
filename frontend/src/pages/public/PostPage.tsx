import { apiGet } from '@/api/apiClient';
import { Error } from '@/components/Error';
import { ImageDialog } from '@/components/ImageDialog';
import { Post } from '@/components/Post';
import { PostSkeleton } from '@/components/skeleton/PostSkeleton';
import { useAuthStore } from '@/store/useAuthStore';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type PostDTO from '@shared/models/dto/PostDTO.ts';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { PostImageId } from '@shared/models/generated/PostImage';
import type { ApiErrorDetail } from '@shared/types/ApiResult';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, type Location } from 'react-router-dom';

type ImageDialogState = {
    imageId: PostImageId;
    images: PostImageExtended[];
} | null;

export function PostPage() {
    const ready = useAuthStore(s => s.ready);
    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState<PostDTO | null>(null);
    const [error, setError] = useState<ApiErrorDetail | null>(null);
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const origLocation = useRef<Location | null>(null);
    const [viewer, setViewer] = useState<ImageDialogState>(null);

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
            if (result.error) setError(result.error);
        }
    };

    const handlePostDeleted = () => {
        navigate('/');
    };

    const handlePostUpdated = (post: PostDTO) => {
        setPost(post);
    };

    const handlePostImageClick = (imageId: PostImageId, images: PostImageExtended[]) => {
        setViewer({ imageId, images });
        origLocation.current = location;
        window.history.pushState({}, '', `/images/${imageId}`);
    };

    useEffect(() => {
        const onPopState = () => setViewer(null);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const closeImageDialog = () => {
        setViewer(null);
        navigate(origLocation.current ? (origLocation.current.pathname + origLocation.current.search) : '/', { replace: true });
    };

    useEffect(() => {
        ready && getData();
    }, [ready]);

    if (!id) return <Navigate to="/" replace />;
    if (error) return <Error error={error} />;
    return <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
        <Box>
            {!post || isLoading
                ? <PostSkeleton />
                : <Post
                    post={post}
                    onDeleted={handlePostDeleted}
                    onUpdated={handlePostUpdated}
                    onImageClick={handlePostImageClick}
                />}

            {viewer && <ImageDialog
                open
                imageId={viewer.imageId}
                images={viewer.images}
                closeDialog={closeImageDialog}
            />}
        </Box>
    </Container>
}