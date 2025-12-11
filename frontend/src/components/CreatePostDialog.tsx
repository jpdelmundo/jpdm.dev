import { apiPost } from '@/api/apiClient';
import { getFingerprint } from '@/utils/device';
import { getDimensionOrientation, getErrorMessage, getImageFileDetail, scrollbarWidthAware } from '@/utils/helper';
import type PostDTO from '@shared/models/extensions/PostExtended';
import type { File as FileModel } from '@shared/models/generated/File';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

import type { CollageImage } from '@/types/CollageImage';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import { ImageCollage } from './ImageCollage';

type UploadFile = {
    file: File;
    url: string;
    width: number;
    height: number;
    clientId: string;
    fileId: string | null;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'error'
}

export type FormInput = {
    title?: string;
    content: string;
};

type CreatePostDialogProps = {
    open: boolean,
    closeDialog?: () => void,
    onPosted: () => void
};

export function CreatePostDialog({ open, closeDialog, onPosted }: CreatePostDialogProps) {
    const { register, handleSubmit, reset, formState: { errors, isValid }, resetField, setFocus } = useForm<FormInput>({
        mode: 'onChange'
    });
    const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [orientation, setOrientation] = useState<ImageOrientation>('unknown');
    const [titleInputHidden, setTitleInputHidden] = useState(true);

    const onSubmit: SubmitHandler<FormInput> = async (data) => {
        console.log('submit clicked');
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const uploadedImages = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const imageFile = imageFiles[i];

                if (imageFile.uploadStatus == 'pending' || imageFile.uploadStatus == 'error') {
                    setImageFiles(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], uploadStatus: 'uploading' };
                        return updated;
                    });

                    try {
                        const formData = new FormData();
                        formData.append('file', imageFile.file);
                        formData.append('fp', jsonBase64Encode(getFingerprint()));
                        const result = await apiPost<FileModel>('/files/upload', formData);
                        if (!result.ok || !result.data?.id) throw Error(`Upload failed: ${result.error?.message}`);

                        const fileId = result.data.id;
                        setImageFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], uploadStatus: 'completed', fileId };
                            return updated;
                        });

                        uploadedImages.push({
                            fileId,
                            sort: i + 1
                        });
                    } catch (error) {
                        setImageFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], uploadStatus: 'error' };
                            return updated;
                        });
                        throw error;
                    }

                } else if (imageFile.uploadStatus == 'completed') {
                    uploadedImages.push({
                        fileId: imageFile.fileId,
                        sort: i + 1
                    });
                }
            }

            //create the post with image ids
            !data.title?.trim() && delete data.title;
            const result = await apiPost<PostDTO>('/posts', { ...data, files: uploadedImages });
            if (result.ok) {
                reset();
                setImageFiles([]);
                setErrorMessage('');
                uploadedImages.length = 0;
                setTitleInputHidden(true);
                resetField('title');
                onPosted?.();
                closeDialog?.();
            } else {
                setErrorMessage(getErrorMessage(result));
            }
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newFiles: UploadFile[] = [];
        for (const file of files) {
            const imageDetail = await getImageFileDetail(file);
            newFiles.push({
                file,
                url: URL.createObjectURL(file),
                width: imageDetail.width,
                height: imageDetail.height,
                clientId: Math.random().toString(36).slice(2),
                fileId: null,
                uploadStatus: 'pending'
            });
        }

        setImageFiles(prev => {
            return ([
                ...prev,
                ...newFiles
            ]);
        });

        e.target.value = '';
    }

    const onAddPostTitleClick = () => {
        setTitleInputHidden(!titleInputHidden);
        resetField('title');
        setTimeout(() => {
            setFocus(titleInputHidden ? 'title' : 'content');
        }, 10);
    };

    useEffect(() => {
        (async () => {
            if (imageFiles.length > 0) {
                if (imageFiles.length < 4) {
                    const imageDetail = await getImageFileDetail(imageFiles[0].file);
                    const orientation = getDimensionOrientation(imageDetail.width, imageDetail.height);
                    setOrientation(orientation);
                } else {
                    const orientationCount: Record<ImageOrientation, number> = { landscape: 0, portrait: 0, square: 0, unknown: 0 };
                    for (let i = 0; i < 5; i++) {
                        const imageDetail = await getImageFileDetail(imageFiles[i].file);
                        const orientation = getDimensionOrientation(imageDetail.width, imageDetail.height);
                        (orientation == 'landscape' || orientation == 'portrait') && orientationCount[orientation]++;
                    }
                    const orientation = Object.entries(orientationCount).sort((a, b) => b[1] - a[1])[0][0] as ImageOrientation;
                    //if more of portrait, flex direction = column (the second row will contain portrait images)
                    //if more of landscape, flex direction = row (the second row will contain landscape images)
                    setOrientation(orientation == 'portrait' ? 'landscape' : 'portrait');
                }
            }
        })();
    }, [imageFiles]);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => { setFocus('content'); }, 10);
        scrollbarWidthAware(open);

        return () => {
            clearTimeout(timer);
            scrollbarWidthAware(false);
        }
    }, [open]);

    const collageImages = imageFiles.map(v => ({
        width: v.width,
        height: v.height,
        url: v.url,
        id: v.clientId
    } as CollageImage));

    return (
        <Dialog
            className={'create-post-dialog scrollbar-width-aware'}
            open={open}
            onClose={closeDialog}
            scroll="paper"
            transitionDuration={0}
            fullWidth
            disableScrollLock
        >
            <DialogTitle textAlign="center">Create post</DialogTitle>
            <DialogContent sx={{ p: '15px' }}>
                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    id="post-form"
                >
                    <Paper className="post-form">
                        <TextField
                            label=""
                            placeholder="Add title here"
                            {...register('title', {
                                maxLength: { value: 200, message: 'Title length too long' }
                            })}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            fullWidth
                            multiline
                            sx={{ display: titleInputHidden ? 'none' : '' }}
                            slotProps={{
                                input: {
                                    sx: {
                                        fontWeight: 'bold'
                                    }
                                }
                            }}
                        />
                        <TextField
                            label=""
                            placeholder="What's on your mind?"
                            multiline
                            {...register('content',
                                {
                                    required: 'Post content required',
                                    maxLength: { value: 2000, message: 'Post body length too long' },
                                    onChange: () => { setErrorMessage('') }
                                }
                            )}
                            error={!!errors.content}
                            helperText={errors.content?.message}
                            fullWidth
                        />
                        <Box
                            display={imageFiles.length == 0 ? 'none' : 'block'}
                            borderRadius={1}
                            overflow="hidden"
                            mt={1}
                        >
                            <ImageCollage orientation={orientation} images={collageImages} />
                        </Box>
                    </Paper>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '15px' }}>
                <Stack flex={1} gap={1}>
                    <Box display="flex" justifyContent="flex-end">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            ref={inputFileRef}
                            style={{ display: 'none' }}
                        />
                        <Button size="small" onClick={onAddPostTitleClick}>{titleInputHidden ? 'Add post title' : 'Remove post title'}</Button>
                        <IconButton
                            color="primary"
                            onClick={() => inputFileRef.current?.click()}
                            disableRipple
                            sx={{ py: 0 }}>
                            <AddPhotoAlternate fontSize="large" />
                        </IconButton>
                    </Box>
                    <Stack gap={1}>
                        <Button
                            type="submit"
                            form="post-form"
                            variant="contained"
                            disabled={!isValid || isSubmitting}
                            loading={isSubmitting}
                            fullWidth
                        >Post</Button>
                        {errorMessage && <Typography color="error" textAlign="center">{errorMessage}</Typography>}
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}