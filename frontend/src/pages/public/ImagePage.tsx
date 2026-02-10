import { ImageDialog } from '@/components/ImageDialog';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export function ImagePage() {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const closeDialog = () => {
        setOpen(false);
        navigate('/', { replace: true });
    };
    const { id } = useParams();

    if (!id) return <Navigate to="/" replace />;

    return <ImageDialog
        open={open}
        closeDialog={closeDialog}
        imageId={id}
    />;
}