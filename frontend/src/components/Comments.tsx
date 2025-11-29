import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { PostId } from '@shared/models/generated/Post';
import type { Paginated } from '@shared/types/Paginated';
import { useEffect } from 'react';
import { Comment } from './Comment';

type CommentsProps = {
    open: boolean;
    postId: PostId;
}

export function Comments({ open, postId }: CommentsProps) {
    const [comments, setComments] = useState(null);

    const getData = async () => {
        const result = await apiGet<Paginated<PostExtended>>('/posts/:postId/comments', { page_num: 1 });
        if (result.ok && result.data) {
            setComments(result.data.page_items);
        }
    };

    useEffect(() => {
        getData();
    });

    return open && <Box className="comments">
        <Stack>
            {comments && comments.map(v => <Comment comment={v} key={v.id} />)}
        </Stack>
    </Box>
}