import { apiGet } from '@/api/apiClient';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { Post } from '@/components/Post';
import { PostSkeleton } from '@/components/skeleton/PostSkeleton';
import { useAuthStore } from '@/store/useAuthStore';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type PostDTO from '@shared/models/extensions/PostExtended';
import type { Paginated } from '@shared/types/Paginated';
import { useEffect, useState } from 'react';

export const UpdatesPage = () => {
    const ready = useAuthStore(s => s.ready);
    const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
    const [posts, setPosts] = useState<PostDTO[]>([]);
    const user = useAuthStore(s => s.user);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        ready && getData();
    }, [ready]);

    return (<Box mt={1}>
        {user?.username == 'jp'
            && <Paper
                elevation={0}
                onClick={() => setCreatePostDialogOpen(true)}
                sx={{
                    borderRadius: '16px',
                    padding: '15px',
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
                <Post key={post.id} post={post} />
            ))}

        <CreatePostDialog
            open={createPostDialogOpen}
            closeDialog={() => setCreatePostDialogOpen(false)}
            onPosted={onPosted}
        />
    </Box>);
}