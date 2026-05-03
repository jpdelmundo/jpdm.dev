import { apiGet } from '@/api/apiClient';
import { ImageDialog } from '@/components/ImageDialog';
import { Post } from '@/components/Post';
import { PostDialog } from '@/components/PostDialog';
import { PostSkeleton } from '@/components/skeleton/PostSkeleton';
import { useAuthStore } from '@/store/useAuthStore';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type PostDTO from '@shared/models/dto/PostDTO.ts';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { PostImageId } from '@shared/models/generated/PostImage';
import type { Paginated } from '@shared/types/Paginated';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

type ImageDialogState = {
    imageId: PostImageId;
    images: PostImageExtended[];
} | null;

export const UpdatesPage = () => {
    //console.log('UpdatesPage render');
    const ready = useAuthStore(s => s.ready);
    const user = useAuthStore(s => s.user);
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [posts, setPosts] = useState<PostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewer, setViewer] = useState<ImageDialogState>(null);
    const origLocation = useRef<Location | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const getData = async () => {
        setIsLoading(true);
        const result = await apiGet<Paginated<PostDTO>>('/users/jp/posts', { page_num: 1 });
        setIsLoading(false);
        if (result.ok && result.data) {
            setPosts(result.data.page_items);
        }
    };

    const onPosted = () => {
        getData();
    }

    const handlePostDeleted = useCallback((post: PostDTO) => {
        setPosts(prev => prev.filter(v => v.id !== post.id));
    }, []);

    const handlePostUpdated = useCallback((post: PostDTO) => {
        setPosts(prev => prev.map(v => v.id === post.id ? post : v));
    }, []);

    const handlePostImageClick = useCallback((imageId: PostImageId, images: PostImageExtended[]) => {
        setViewer({ imageId, images });
        origLocation.current = location;
        window.history.pushState({}, '', `/images/${imageId}`);
    }, []);

    // const handlePostImageClick = useCallback((imageId: PostImageId, images: PostImageExtended[]) => {
    //     setViewer({ imageId, images });
    //     origLocation.current = location;
    //     window.history.pushState({}, '', `/images/${imageId}`);
    // }, []);

    const closeImageDialog = useCallback(() => {
        setViewer(null);
        navigate(origLocation.current ? (origLocation.current.pathname + origLocation.current.search) : '/', { replace: true });
    }, [navigate]);

    useEffect(() => {
        ready && getData();
    }, [ready]);

    return (
        <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
            <Box mt={'5px'}>
                {user?.username == 'jp'
                    && <Paper
                        elevation={0}
                        onClick={() => setPostDialogOpen(true)}
                        sx={{
                            borderRadius: '16px',
                            padding: '15px',
                            marginBottom: '25px',
                            cursor: 'text',
                            '&:hover': {
                                transition: 'box-shadow 0.25s ease',
                                boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.20)',
                            }
                        }}
                    >
                        <Typography>What's on you mind?</Typography>
                    </Paper>}

                {isLoading
                    ? <PostSkeleton />
                    : posts && posts.map(post => (
                        <Post
                            key={post.id}
                            post={post}
                            onDeleted={handlePostDeleted}
                            onUpdated={handlePostUpdated}
                            onImageClick={handlePostImageClick}
                        />
                    ))}

                <PostDialog
                    open={postDialogOpen}
                    closeDialog={() => setPostDialogOpen(false)}
                    onCreated={onPosted}
                />

                {viewer && <ImageDialog
                    open
                    imageId={viewer.imageId}
                    images={viewer.images}
                    closeDialog={closeImageDialog}
                />}
            </Box>
        </Container>);
}