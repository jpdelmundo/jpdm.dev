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
import type { PostImageId } from '@shared/models/generated/PostImage';
import type { Paginated } from '@shared/types/Paginated';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

export const UpdatesPage = () => {
    //console.log('UpdatesPage render');
    const ready = useAuthStore(s => s.ready);
    const user = useAuthStore(s => s.user);
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [posts, setPosts] = useState<PostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<PostImageId | null>(null);
    const origLocation = useRef<Location | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [pageNum, setPageNum] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

    const getData = async () => {
        setIsLoading(true);
        const result = await apiGet<Paginated<PostDTO>>('/users/jp/posts', { page_num: 1 });
        setIsLoading(false);
        if (result.ok && result.data) {
            const { page_num, page_items, total, page_size } = result.data;
            setPosts(page_items);
            setPageNum(page_num);
            setHasMore(page_num < Math.ceil(total / page_size));
        }
    };

    const loadMore = async () => {
        setIsLoadMoreLoading(true);
        const result = await apiGet<Paginated<PostDTO>>('/users/jp/posts', { page_num: pageNum + 1 });
        setIsLoadMoreLoading(false);
        if (result.ok && result.data) {
            const { page_num, page_items, total, page_size } = result.data;
            setPosts(prev => [...prev, ...page_items]);
            setPageNum(page_num);
            setHasMore(page_num < Math.ceil(total / page_size));
        }
    }

    const onPosted = () => {
        getData();
    }

    const handlePostDeleted = useCallback((post: PostDTO) => {
        setPosts(prev => prev.filter(v => v.id !== post.id));
    }, []);

    const handlePostUpdated = useCallback((post: PostDTO) => {
        setPosts(prev => prev.map(v => v.id === post.id ? post : v));
    }, []);

    const handlePostImageClick = useCallback((imageId: PostImageId) => {
        setSelectedImageId(imageId);
        origLocation.current = location;
        window.history.pushState({}, '', `/images/${imageId}`);
    }, [location]);

    const closeImageDialog = useCallback(() => {
        setSelectedImageId(null);
        navigate(origLocation.current ? (origLocation.current.pathname + origLocation.current.search) : '/', { replace: true });
    }, [navigate]);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(async entries => {
            if (entries[0].isIntersecting) {
                if (hasMore && !isLoadMoreLoading) {
                    loadMore();
                }
            }
        }, { rootMargin: '50px' });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadMoreLoading]);

    useEffect(() => {
        const onPopState = () => setSelectedImageId(null);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    useEffect(() => {
        ready && getData();
    }, [ready]);

    return (
        <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
            <Box>
                {user?.username == 'jp'
                    && <Paper
                        onClick={() => setPostDialogOpen(true)}
                        sx={{
                            border: 'solid 1px #00000011',
                            boxShadow: '0 2px 2px -1px #00000011',
                            borderRadius: '16px',
                            padding: '15px',
                            marginTop: '5px',
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

                {isLoading && <PostSkeleton />}

                {posts && posts.map(post => (
                    <Post
                        key={post.id}
                        post={post}
                        onDeleted={handlePostDeleted}
                        onUpdated={handlePostUpdated}
                        onImageClick={handlePostImageClick}
                    />
                ))}

                {isLoadMoreLoading && <PostSkeleton />}

                <div ref={sentinelRef} style={{ height: '1px' }} />

                <PostDialog
                    open={postDialogOpen}
                    closeDialog={() => setPostDialogOpen(false)}
                    onCreated={onPosted}
                />

                {selectedImageId && <ImageDialog
                    open
                    imageId={selectedImageId}
                    closeDialog={closeImageDialog}
                />}
            </Box>
        </Container>);
}