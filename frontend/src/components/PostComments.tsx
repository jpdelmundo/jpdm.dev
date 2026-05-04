import { apiGet, apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useConfirmStore } from '@/store/useConfirmStore.ts';
import type { PostCommentsUpdatedParams } from '@/types/PostCommentsUpdatedParams';
import { getErrorMessage, isTopInView, scrollIntoView } from '@/utils/helper';
import SendRounded from '@mui/icons-material/SendRounded';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import WarningRounded from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PostCommentDTO } from '@shared/models/dto/PostCommentDTO';
import type { PostId } from '@shared/models/generated/Post';
import type { Paginated } from '@shared/types/Paginated';
import { useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import { PostComment } from './PostComment';
import TextField from './TextField';
import { PostCommentSkeleton } from './skeleton/PostCommentSkeleton';

type PostCommentsProps = {
    open: boolean;
    postId: PostId;
    onCommentsUpdated: (params: PostCommentsUpdatedParams) => void;
}

// type FormSubmitResult = { access_token: AccessToken, user_id: UserId }

type FormInput = {
    comment: string;
}

type GetDataParams = {
    page_num: number;
}

export function PostComments({ open, postId, onCommentsUpdated }: PostCommentsProps) {
    const [comments, setComments] = useState<PostCommentDTO[]>([]);
    const { handleSubmit, register, resetField } = useForm<FormInput>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [pageNum, setPageNum] = useState(1);
    const [isLoadMoreVisible, setIsLoadMoreVisible] = useState(false);
    const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const commentsRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const confirm = useConfirmStore(s => s.confirm);

    const loadComments = async () => {
        setIsLoadMoreVisible(false);
        setIsLoading(true);
        await getData();
        setIsLoading(false);
    }

    const getData = async ({ page_num }: GetDataParams = { page_num: 1 }) => {
        const result = await apiGet<Paginated<PostCommentDTO>>(`/comments`, { page_num, post_id: postId });
        if (result.ok && result.data) {
            const { page_items, page_size, page_num, total } = result.data;
            setComments(page_items);
            setIsLoadMoreVisible(page_num < Math.ceil(total / page_size));
        }
    };

    const submitHandler: SubmitHandler<FormInput> = async (data) => {
        if (!data.comment.trim()) return;
        setErrorMessage('');
        setIsSubmitting(true);
        const result = await apiPost<PostCommentDTO>(`/comments`, { ...data, post_id: postId });
        if (result.ok) {
            resetField('comment');
            setPageNum(1);
            onCommentsUpdated({ type: 'comment_added' });
            await getData();
            const newCommentEl = commentsRef.current as Element;
            if (!isTopInView(newCommentEl, 60)) scrollIntoView(newCommentEl, 100);
        } else {
            setErrorMessage(getErrorMessage(result));
        }
        setIsSubmitting(false);
    }

    const loadMoreOnClick = async () => {
        setIsLoadMoreLoading(true);
        const result = await apiGet<Paginated<PostCommentDTO>>(`/comments`, { page_num: pageNum + 1, post_id: postId });
        if (result.ok && result.data) {
            const { page_items, page_size, page_num, total } = result.data;
            setComments(prev => [...prev, ...page_items]);
            setPageNum(prev => prev + 1);
            setIsLoadMoreVisible(page_num < Math.ceil(total / page_size));
        }
        setIsLoadMoreLoading(false);
    }

    const commentInputOnFocus = async (e: FocusEvent<HTMLInputElement>) => {
        if (!isAuthenticated) {
            e.target.blur();
            const confirmed = await confirm({
                message: 'To continue, you need to sign in or create an account.',
                confirmText: 'Go to sign-in page'
            });

            if (confirmed) {
                navigate('/signin');
            }
        };
    }

    const commentsOnExited = () => {
        //console.log('commentsOnExited called');
        setComments([]);
        setPageNum(1);
        //setShowComments(false);
        setIsLoadMoreVisible(false);
    }

    const commentsOnEntered = () => {
        loadComments();
    }

    const commentsLoadingOnCollapse = () => {
        //setShowComments(true);
        //console.log('commentsLoadingOnCollapse called');
    }

    const commentInputOnKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement | HTMLInputElement;
            target.form?.requestSubmit();
        }
    }

    const handleCommentUpdated = (comment: PostCommentDTO) => {
        setComments(prev => prev.map(v => v.id === comment.id ? comment : v));
    }

    const handleCommentDeleted = (comment: PostCommentDTO) => {
        setComments(prev => prev.filter(v => v.id !== comment.id));
        onCommentsUpdated({ type: 'comment_deleted' });
    }

    return <>
        <Collapse in={open} onEntered={commentsOnEntered} onExited={commentsOnExited}>
            <Box className="comments" ref={commentsRef}>
                <Stack className="list">
                    <Collapse in={isLoading} onExited={commentsLoadingOnCollapse}>
                        <PostCommentSkeleton />
                    </Collapse>
                    <TransitionGroup>
                        {comments && comments.map((v, i) => (
                            <Collapse key={v.id}>
                                <PostComment
                                    comment={v}
                                    index={i}
                                    onDeleted={handleCommentDeleted}
                                    onUpdated={handleCommentUpdated}
                                />
                            </Collapse>
                        ))}
                    </TransitionGroup>
                    <Collapse in={isLoadMoreLoading}>
                        <PostCommentSkeleton />
                    </Collapse>
                    <Button
                        className="show-more"
                        variant="contained"
                        onClick={loadMoreOnClick}
                        sx={{ display: isLoadMoreVisible ? 'block' : 'none', borderRadius: 2 }}
                    >Show more comments</Button>
                </Stack>
                <Box className="new-comment">
                    <form noValidate onSubmit={handleSubmit(submitHandler)}>
                        <TextField
                            {...register('comment')}
                            placeholder="Write a comment..."
                            fullWidth
                            disabled={isSubmitting}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {isSubmitting
                                                ? <Box sx={{ display: 'flex', gap: 1, marginRight: '12px' }}><Typography fontSize={'small'}>Posting</Typography> <CircularProgress size="20px" /></Box>
                                                : <IconButton type="submit" color="primary"><SendRounded /></IconButton>}
                                        </InputAdornment>
                                    )
                                }
                            }}
                            onFocus={commentInputOnFocus}
                            multiline
                            onKeyDown={commentInputOnKeyDown}
                        />
                    </form>
                </Box>
                {errorMessage && <Typography
                    color="error"
                    mt={'10px'}
                    display={'flex'}
                    alignItems={'center'}
                ><WarningRounded color="warning" /> <SmartToyOutlined sx={{ color: '#555555' }} /> <span style={{ marginLeft: '5px' }}>{errorMessage}</span>
                </Typography>}
            </Box>
        </Collapse>
    </>
}