import { apiGet } from '@/api/apiClient';
import { PostImageDialog } from '@/components/PostImageDialog';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export function PostImage() {
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const closeDialog = () => {
        const from = location.state?.from?.pathname || '/';
        setOpen(false);
        navigate(from);
    };
    const { id } = useParams();
    const [postImage, setPostImage] = useState<PostImageExtended | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getData = async () => {
        setIsLoading(true);
        const result = await apiGet<PostImageExtended>(`/posts/images/${id}`);
        console.log({ result });
        setIsLoading(false);
        if (result.ok && result.data) {
            setPostImage(result.data);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return <PostImageDialog
        open={open}
        closeDialog={closeDialog}
        postImage={postImage}
        isLoading={isLoading}
    />;
}