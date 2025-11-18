import { apiGet } from '@/api/apiClient';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { Post } from '@/components/Post';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type { Paginated } from '@shared/types/Paginated';
import { useEffect, useState } from 'react';

export const Updates = () => {
    const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
    const [posts, setPosts] = useState<PostExtended[]>([]);

    useEffect(() => {
        const getData = async () => {
            const result = await apiGet<Paginated<PostExtended>>('/user/posts/jp', { page: 1, rows: 30 });
            if (result.ok && result.data) {
                setPosts(result.data.page_items);
            }
        };
        getData();
    }, []);


    return (<Box>
        <Paper elevation={0} onClick={() => setCreatePostDialogOpen(true)}>
            <Typography>What's on you mind?</Typography>
        </Paper>

        {posts && posts.map(post => (
            <Post key={post.id} post={post} />
        ))}

        <CreatePostDialog open={createPostDialogOpen} closeDialog={() => setCreatePostDialogOpen(false)} />
    </Box>);
}