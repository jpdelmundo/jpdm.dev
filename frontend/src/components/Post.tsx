import { apiDelete, apiPost } from '@/api/apiClient';
import { usePostViewLogger } from '@/hooks/usePostViewCounter';
import { useAuthStore } from '@/store/useAuthStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useSnackbarStore } from '@/store/useSnackbarStore';
import type { CollageImage } from '@/types/CollageImage';
import type { CommentsUpdatedParams } from '@/types/CommentsUpdatedParams';
import { copyToClipboard, formatCounters, getDimensionOrientation, getRelativeTime, stringToHslColor } from '@/utils/helper';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import EqualizerRounded from '@mui/icons-material/EqualizerRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type ImageExtended from '@shared/models/extensions/ImageExtended';
import type PostDTO from '@shared/models/extensions/PostExtended';
import type { ImageId } from '@shared/models/generated/Image';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { memo, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Comments } from './Comments';
import { ImageCollage } from './ImageCollage';
import { PostDialog } from './PostDialog';
import { Tooltip } from './Tooltip';

type PostProps = {
    post: PostDTO;
    onDeleted?: (post: PostDTO) => void;
    onUpdated?: (post: PostDTO) => void;
    onImageClick: (imageId: ImageId, images: ImageExtended[]) => void;
};

export const Post = memo(({ post, onDeleted, onUpdated, onImageClick }: PostProps) => {
    console.log('Post render');
    const { id, title, content, images, display_name, created_at, comments_count, views, likes, is_liked } = post;
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsCount, setCommentsCount] = useState(comments_count);
    const [likesCount, setLikesCount] = useState(likes);
    const [postLiked, setPostLiked] = useState(is_liked);
    const ref = useRef<HTMLDivElement | null>(null);
    const viewLogger = usePostViewLogger();
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const showMessage = useSnackbarStore(s => s.showMessage);
    const [postMenuOpen, setPostMenuOpen] = useState(false);
    const [postMenuAnchor, setPostMenuAnchor] = useState<HTMLElement | null>(null);
    const confirm = useConfirmStore(s => s.confirm);
    const [isDeleting, setIsDeleting] = useState(false);
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [editPost, setEditPost] = useState<PostDTO | null>(null);

    const orientation = useMemo(() => {
        if (!images.length) return 'portrait';

        const img = images[0];
        if (images.length < 4) {
            return getDimensionOrientation(img.width, img.height);
        } else {
            const orientationCount: Record<ImageOrientation, number> = { landscape: 0, portrait: 0, square: 0, unknown: 0 };
            for (let i = 0; i < 5; i++) {
                const imgOrientation = getDimensionOrientation(img.width, img.height);
                (imgOrientation == 'landscape' || imgOrientation == 'portrait') && orientationCount[imgOrientation]++;
            }
            const dominantOrientation = Object.entries(orientationCount).sort((a, b) => b[1] - a[1])[0][0] as ImageOrientation;
            //if more of portrait, flex direction = column (the second row will contain portrait images)
            //if more of landscape, flex direction = row (the second row will contain landscape images)
            return dominantOrientation == 'portrait' ? 'landscape' : 'portrait';
        }
    }, [images]);

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

    const postOptionsOnClick = (e: MouseEvent<HTMLElement>) => {
        setPostMenuAnchor(e.currentTarget);
        setPostMenuOpen(true);
    }

    const postMenuOnClose = () => {
        setPostMenuOpen(false);
    }

    const editOnClick = () => {
        setEditPost(post);
        setPostDialogOpen(true);
        setPostMenuOpen(false);
    }

    const deleteOnClick = async () => {
        const confirmed = await confirm({ message: 'Are you sure you want to delete this post?', confirmText: 'Delete' });
        setPostMenuOpen(false);

        if (confirmed) {
            setIsDeleting(true);
            const result = await apiDelete(`/posts/${post.id}`);
            setIsDeleting(false);
            if (result.ok) {
                onDeleted?.(post);
            } else {
                //TODO show toast box failed message
            }
        }
    }

    const handlePostDialogClose = () => {
        setPostDialogOpen(false);
    }

    const handleOnImageClick = (image: CollageImage) => {
        onImageClick(image.id, images);
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
            <Paper
                className="post"
                elevation={0}
                ref={ref}
                sx={{
                    opacity: isDeleting ? 0.8 : 1,
                    pointerEvents: isDeleting ? 'none' : '',
                    filter: isDeleting ? 'grayscale(1)' : ''
                }}
            >
                <Stack direction={'row'}>
                    {title && <Typography className="title"  {...(title.length <= 150 && { fontSize: { xs: '30px', sm: '40px' } })}>{title}</Typography>}
                    <IconButton sx={{ marginLeft: 'auto', position: 'absolute', right: '25px', top: '20px', padding: '2px' }} onClick={postOptionsOnClick}><MoreHorizRounded /></IconButton>
                </Stack>
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
                    <ImageCollage orientation={orientation} images={images} onImageClick={handleOnImageClick} />
                </Box>
                <Typography className="content" {...(content.length <= 50 && { fontSize: { xs: '20px', sm: '30px' } })}>{content}</Typography>
                <Stack direction={'row'} className="controls">
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
                    <Box className="stats-button-container">
                        <Tooltip title="Views">
                            <Stack direction={'row'} className="icon-stats" onClick={statsButtonOnClick}><EqualizerRounded sx={{ color: '#77d2ffff' }} /> <Typography>{formatCounters(views) || ''}</Typography></Stack>
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

            <Menu
                className="context-menu"
                anchorEl={postMenuAnchor}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={postMenuOpen}
                onClose={postMenuOnClose}
                transitionDuration={0}
                disableScrollLock={true}
                elevation={0}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            boxShadow: '0 1px 2px #cccccc',
                            overflow: 'unset',
                        }
                    }
                }}
            >
                <MenuItem onClick={editOnClick}>Edit</MenuItem>
                <MenuItem onClick={deleteOnClick}>Delete</MenuItem>
            </Menu>

            {postDialogOpen && <PostDialog
                post={editPost}
                open={postDialogOpen}
                closeDialog={handlePostDialogClose}
                onUpdated={onUpdated}
            />}
        </>
    );
});