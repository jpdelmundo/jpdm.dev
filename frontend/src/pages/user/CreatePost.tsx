import { CreatePostForm } from '@/components/CreatePostForm';
import { Paper } from '@mui/material';

export function CreatePost() {
    return (
        <Paper elevation={0} sx={{ p: 6, maxWidth: 'sm', mx: 'auto' }}>
            <CreatePostForm />
        </Paper>
    );
}