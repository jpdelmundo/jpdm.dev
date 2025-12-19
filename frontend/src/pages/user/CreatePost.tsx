import { PostDialog } from '@/components/PostDialog';
import { useState } from 'react';

export function CreatePost() {
    const [dialogOpen, setDialogOpen] = useState(true);

    return <PostDialog
        open={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
        onCreated={() => { }}
    />
}