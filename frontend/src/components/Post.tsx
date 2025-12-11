import { apiPost } from '@/api/apiClient';
import { usePostViewLogger } from '@/hooks/usePostViewCounter';
import { useAuthStore } from '@/store/useAuthStore';
import { useSnackbarStore } from '@/store/useSnackbarStore';
import type { CollageImage } from '@/types/CollageImage';
import type { CommentsUpdatedParams } from '@/types/CommentsUpdatedParams';
import { copyToClipboard, formatCounters, getDimensionOrientation, getRelativeTime, stringToHslColor } from '@/utils/helper';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import EqualizerRounded from '@mui/icons-material/EqualizerRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type PostDTO from '@shared/models/extensions/PostExtended';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { memo, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { Comments } from './Comments';
import { ImageCollage } from './ImageCollage';
import { ImageDialog } from './ImageDialog';
import { Tooltip } from './Tooltip';

type PostProps = {
    post: PostDTO;
};

export const Post = memo(({ post }: PostProps) => {
    const { id, title, content, images, display_name, created_at, comments_count, views, likes, is_liked } = post;
    let orientation: ImageOrientation = 'portrait';
    const location = useLocation();
    const navigate = useNavigate();
    const [postImageDialogOpen, setImageDialogOpen] = useState(false);
    const closeImageDialog = () => {
        setImageDialogOpen(false);
        navigate(origLocation.current ? (origLocation.current.pathname + origLocation.current.search) : '/', { replace: true });
    };
    const [selectedImage, setSelectedImage] = useState<CollageImage | null>(null);
    const origLocation = useRef<Location | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsCount, setCommentsCount] = useState(comments_count);
    const [viewsCount, setViewsCount] = useState(views);
    const [likesCount, setLikesCount] = useState(likes);
    const [postLiked, setPostLiked] = useState(is_liked);
    const ref = useRef<HTMLDivElement | null>(null);
    const viewLogger = usePostViewLogger();
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const showMessage = useSnackbarStore(s => s.showMessage);

    if (images && images.length > 0) {
        const img = images[0];
        if (images.length < 4) {
            orientation = getDimensionOrientation(img.width, img.height);
        } else {
            const orientationCount: Record<ImageOrientation, number> = { landscape: 0, portrait: 0, square: 0, unknown: 0 };
            for (let i = 0; i < 5; i++) {
                const imgOrientation = getDimensionOrientation(img.width, img.height);
                (imgOrientation == 'landscape' || imgOrientation == 'portrait') && orientationCount[imgOrientation]++;
            }
            orientation = Object.entries(orientationCount).sort((a, b) => b[1] - a[1])[0][0] as ImageOrientation;
            //if more of portrait, flex direction = column (the second row will contain portrait images)
            //if more of landscape, flex direction = row (the second row will contain landscape images)
            orientation = orientation == 'portrait' ? 'landscape' : 'portrait';
        }
    }

    const onImageClick = (image: CollageImage) => {
        console.log({ image });
        setSelectedImage(image);
        setImageDialogOpen(true);
        origLocation.current = location;
        window.history.pushState({}, '', `/images/${image.id}`);
    }

    const statsButtonOnClick = () => {
        //showMessage('Test');
    }

    const likesButtonOnClick = () => {
        if (!isAuthenticated) {
            return alert('show login');
        };
        setPostLiked(prev => !prev);
        setLikesCount(prev => postLiked ? prev - 1 : prev + 1);
        apiPost(`/posts/${post.id}/${postLiked ? 'unlike' : 'like'}`);
    }

    const commentsButtonOnClick = () => {
        setCommentsOpen(prev => !prev);
    }

    const shareButtonOnClick = async () => {
        await copyToClipboard(`${window.location.origin}/posts/${post.id}`);
        showMessage(<Box display={'flex'} alignItems={'center'} gap={1}><CheckCircleRounded fontSize="small" /> Copied URL to clipboard</Box>);
    }

    const onCommentsUpdated = (params: CommentsUpdatedParams) => {
        const { type } = params;
        type == 'comment_added' && setCommentsCount(prev => prev + 1);
        type == 'comment_deleted' && setCommentsCount(prev => prev != 0 ? prev - 1 : 0);
    }

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                viewLogger.log(post.id);
            }
        }, { threshold: 0.5 });

        observer.observe(element);
        return () => {
            observer.unobserve(element);
            observer.disconnect();
        };
    }, [post]);

    return (
        <>
            <Paper className="post" elevation={0} ref={ref}>
                {title && <Typography className="title"  {...(title.length <= 150 && { fontSize: { xs: '30px', sm: '40px' } })}>{title}</Typography>}
                <Stack direction={'row'} className="header">
                    <Avatar sx={{ bgcolor: `${stringToHslColor(display_name)}` }}>{display_name.charAt(0).toUpperCase()}</Avatar>
                    <Box className="user-date-box">
                        <Typography className="user">{display_name}</Typography>
                        <Typography className="date">{getRelativeTime(String(created_at))}</Typography>
                    </Box>
                </Stack>
                <Box
                    display={images.length == 0 ? 'none' : 'block'}
                    borderRadius={1}
                    overflow="hidden"
                >
                    <ImageCollage orientation={orientation} images={images} onImageClick={onImageClick} />
                </Box>
                <Typography className="content" {...(content.length <= 50 && { fontSize: { xs: '20px', sm: '30px' } })}>{content}</Typography>
                <Stack direction={'row'} className="controls">
                    <Box className="stats-button-container">
                        <Tooltip title="Views">
                            <Stack direction={'row'} className="icon-stats" onClick={statsButtonOnClick}><EqualizerRounded sx={{ color: '#77d2ffff' }} /> <Typography>{formatCounters(viewsCount) || ''}</Typography></Stack>
                        </Tooltip>
                    </Box>
                    <Box className="likes-button-container">
                        <Tooltip title="Like">
                            <Stack direction={'row'} className="icon-stats" onClick={likesButtonOnClick}>{postLiked ? <FavoriteRounded sx={{ color: '#bd004fff' }} /> : <FavoriteBorderRounded sx={{ color: '#bd004fff' }} />} <Typography>{formatCounters(likesCount) || ''}</Typography></Stack>
                        </Tooltip>
                    </Box>
                    <Box className="comments-button-container">
                        <Tooltip title="Comments">
                            <Stack direction={'row'} className="icon-stats" onClick={commentsButtonOnClick}><ChatBubbleOutlineRounded /> <Typography>{formatCounters(commentsCount) || ''}</Typography></Stack>
                        </Tooltip>
                    </Box>
                    <Box className="share-button-container">
                        <Tooltip title="Share">
                            <Stack direction={'row'} className="icon-stats" onClick={shareButtonOnClick}><ShareRounded /></Stack>
                        </Tooltip>
                    </Box>
                </Stack>
                <Comments open={commentsOpen} postId={id} onCommentsUpdated={onCommentsUpdated} />
            </Paper>
            {selectedImage && <ImageDialog
                open={postImageDialogOpen}
                closeDialog={closeImageDialog}
                postId={id}
                imageId={selectedImage.id}
            />}
        </>
    );
});