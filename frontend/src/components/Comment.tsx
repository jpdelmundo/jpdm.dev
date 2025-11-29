import { getRelativeTime } from '@/utils/helper';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PostCommentDTO } from '@shared/models/dto/PostCommentDTO';

type CommentProps = {
    comment: PostCommentDTO;
}

export function Comment({ comment }: CommentProps) {
    const { created_at } = comment;

    return <Box className="comment">
        <Stack direction={'row'}>
            <Avatar>JP</Avatar>
            <Stack className="detail">
                <Typography className="user"></Typography>
                <Typography className="content"></Typography>
                <Stack direction={'row'}>
                    <Typography className="date">{getRelativeTime(String(created_at))}</Typography>
                </Stack>
            </Stack>
        </Stack>
    </Box>
}