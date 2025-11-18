import { CreatePostDialog } from '@/components/CreatePostDialog';
import { useState } from 'react';

export function CreatePost() {
    const [dialogOpen, setDialogOpen] = useState(true);

    return <CreatePostDialog
        open={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
    />
}