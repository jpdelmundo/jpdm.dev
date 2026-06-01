import { apiDelete, apiPut } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { getErrorMessage, getRelativeTime } from '@/utils/helper';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import WarningRounded from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PostCommentDTO } from '@shared/models/dto/PostCommentDTO';
import { useState, type KeyboardEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Avatar } from './Avatar.tsx';
import TextField from './TextField';

type PostCommentProps = {
    comment: PostCommentDTO;
    index: number;
    onDeleted: (comment: PostCommentDTO) => void;
    onUpdated: (comment: PostCommentDTO) => void;
}

type FormInput = {
    comment: string;
}

export function PostComment({ comment, index, onDeleted, onUpdated }: PostCommentProps) {
    const { created_at, display_name, comment: post_comment, avatar_url } = comment;
    const { handleSubmit, register, setFocus, reset } = useForm<FormInput>({
        defaultValues: {
            comment: post_comment
        }
    });
    const [editMode, setEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const confirm = useConfirmStore(s => s.confirm);
    const [isProcessing, setIsProcessing] = useState(false);
    const user = useAuthStore(s => s.user);

    const submitHandler: SubmitHandler<FormInput> = async (data) => {
        if (!data.comment.trim()) return;
        setErrorMessage('');
        setIsSubmitting(true);
        const result = await apiPut<PostCommentDTO>(`/comments/${comment.id}`, data);
        if (result.ok && result.data) {
            onUpdated(result.data);
            setEditMode(false);
        } else {
            setErrorMessage(getErrorMessage(result));
        }
        setIsSubmitting(false);
    }

    const handleEditClick = () => {
        reset({ comment: post_comment });
        setEditMode(true);
        setTimeout(() => setFocus('comment'), 100);
    }

    const handleDeleteClick = async () => {
        const confirmed = await confirm({ message: 'Are you sure you want to delete this comment?', confirmText: 'Delete' });

        //call delete api
        if (confirmed) {
            setIsProcessing(true);
            const result = await apiDelete(`/comments/${comment.id}`);
            setIsProcessing(false);
            if (result.ok) {
                onDeleted(comment);
            } else {
                //TODO show toast box failed message
            }
        }
    }

    const commentInputOnKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            setEditMode(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement | HTMLInputElement;
            target.form?.requestSubmit();
        }
    }

    return <Box
        className={index === 0 ? 'comment first' : 'comment'}
        sx={{
            opacity: isProcessing ? 0.5 : 1,
            pointerEvents: isProcessing ? 'none' : 'auto'
        }}
    >
        <Stack direction={'row'} gap={1}>
            <Avatar
                sx={{ width: '32px', height: '32px' }}
                {...{ avatar_url, display_name }}
            />
            {editMode
                ? <Box flexGrow={1}>
                    <Box className="edit-comment">
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
                                                    : <IconButton type="submit" sx={{ '&:hover': { background: 'none', opacity: 0.7 } }}><SendRounded /></IconButton>}
                                            </InputAdornment>
                                        )
                                    }
                                }}
                                multiline
                                onKeyDown={commentInputOnKeyDown}
                            />
                        </form>
                    </Box>
                    {errorMessage && <Typography
                        color="error"
                        display={'flex'}
                        alignItems={'center'}
                    ><WarningRounded color="warning" /> <SmartToyOutlined sx={{ color: '#555555' }} /> <span style={{ marginLeft: '5px' }}>{errorMessage}</span>
                    </Typography>}
                </Box>
                : <Box flexGrow={1}>
                    <Box>
                        <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: '95%' }}>
                            <Stack className="detail">
                                <Typography className="user">{display_name}</Typography>
                                <Typography className="content">{post_comment}</Typography>
                            </Stack>
                            {comment.is_owner && <Box display={'flex'} alignItems={'center'} gap={'4px'} className="comment-options">
                                <IconButton className="edit" onClick={handleEditClick} ><EditRoundedIcon sx={{ fontSize: '14px' }} /></IconButton>
                                <IconButton className="delete" onClick={handleDeleteClick}><ClearRoundedIcon sx={{ fontSize: '14px' }} /></IconButton>
                            </Box>}
                        </Box>
                    </Box>
                    <Stack direction={'row'}>
                        <Typography className="date">{getRelativeTime(String(created_at))}</Typography>
                    </Stack>
                </Box>}
        </Stack>
    </Box>
}