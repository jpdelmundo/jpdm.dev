import { CreatePostForm } from '@/components/CreatePostForm';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type { ApiResult } from '@shared/types/ApiResult';

import Paper from '@mui/material/Paper';

export function CreatePost() {
    const success = (result: ApiResult<PostExtended>) => console.log({ result });

    return (
        <Paper elevation={0} sx={{ p: 6, maxWidth: 'sm', mx: 'auto' }}>
            <CreatePostForm onSuccess={success} />
        </Paper>
    );
}