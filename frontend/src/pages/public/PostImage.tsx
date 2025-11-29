import { PostImageDialog } from '@/components/PostImageDialog';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function PostImage() {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const closeDialog = () => {
        setOpen(false);
        navigate('/', { replace: true });
    };
    const { id } = useParams();

    // const getData = async () => {
    //     setIsLoading(true);
    //     const result = await apiGet<PostImageExtended>(`/posts/images/${id}`, { include_set: true });
    //     setIsLoading(false);
    //     if (result.ok && result.data) {
    //         setPostImage(result.data);
    //     }
    // };

    // useEffect(() => {
    //     getData();
    // }, []);
    console.log({ id });
    if (!id) return navigate('/');

    return <PostImageDialog
        open={open}
        closeDialog={closeDialog}
        postImageId={id}
    />;
}