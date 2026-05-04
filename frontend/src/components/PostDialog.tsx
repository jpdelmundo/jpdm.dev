import { apiPost, apiPut } from '@/api/apiClient';
import { getFingerprint } from '@/utils/device';
import { getDimensionOrientation, getErrorMessage, getImageFileDetail, scrollbarWidthAware } from '@/utils/helper';
import type { File as FileModel } from '@shared/models/generated/File';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
import type PostDTO from '@shared/models/dto/PostDTO.ts';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { ImageOrientation } from '@shared/types/ImageOrientation';
import type { PostImageDraft } from '@shared/types/PostImageDraft';
import { EditPostImagesDialog } from './EditPostImages';
import { ImageCollage } from './ImageCollage';

type PostImage = PostImageDraft | PostImageExtended;

export type FormInput = {
    title: string | null;
    content: string;
};

type PostDialogProps = {
    post?: PostDTO | null;
    open: boolean;
    closeDialog?: () => void;
    onCreated?: () => void;
    onUpdated?: (post: PostDTO) => void;
};

export const PostDialog = ({ post, open, closeDialog, onCreated, onUpdated }: PostDialogProps) => {
    //console.log('PostDialog render', { post });
    const { register, handleSubmit, reset, formState: { errors, isValid }, setFocus, setValue } = useForm<FormInput>({
        defaultValues: {
            title: null
        },
        mode: 'onChange'
    });
    const [imageFiles, setImageFiles] = useState<PostImage[]>([]);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [orientation, setOrientation] = useState<ImageOrientation>('unknown');
    const [titleInputHidden, setTitleInputHidden] = useState(true);
    const [editImagesOpen, setEditImagesOpen] = useState(false);

    const onSubmit: SubmitHandler<FormInput> = async (data) => {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const postImages = [];
            for (let i = 0; i < imageFiles.length; i++) {
                if (post && 'post_id' in imageFiles[i]) {
                    const imageFile = imageFiles[i] as PostImageExtended;
                    postImages.push({
                        file_id: imageFile.file_id,
                        sort: i + 1
                    });
                    continue;
                }

                const imageFile = imageFiles[i] as PostImageDraft;
                if (imageFile.upload_status == 'pending' || imageFile.upload_status == 'error') {
                    setImageFiles(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], upload_status: 'uploading' };
                        return updated;
                    });

                    try {
                        const formData = new FormData();
                        formData.append('file', imageFile.file);
                        formData.append('fp', jsonBase64Encode(getFingerprint()));
                        formData.append('type', 'image');
                        const result = await apiPost<FileModel>('/files/image', formData);
                        if (!result.ok || !result.data?.id) throw Error(`Upload failed: ${result.error?.message}`);

                        const file_id = result.data.id;
                        setImageFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], upload_status: 'completed', file_id };
                            return updated;
                        });

                        postImages.push({
                            file_id,
                            sort: i + 1
                        });
                    } catch (error) {
                        setImageFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], upload_status: 'error' };
                            return updated;
                        });
                        throw error;
                    }
                } else if (imageFile.upload_status == 'completed') {
                    postImages.push({
                        file_id: imageFile.file_id,
                        sort: i + 1
                    });
                }
            }

            //console.log({ imageFiles, postImages });

            const payload = {
                ...data,
                title: data.title?.trim() || null,
                files: postImages
            }
            const isEdit = !!post?.id;
            const result = isEdit
                ? await apiPut<PostDTO>(`/posts/${post.id}`, payload)
                : await apiPost<PostDTO>('/posts', payload);

            if (result.ok) {
                reset();
                setImageFiles([]);
                setErrorMessage('');
                setTitleInputHidden(true);
                !isEdit && onCreated?.();
                isEdit && result.data && onUpdated?.(result.data);

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
        const newFiles: PostImageDraft[] = [];
        let sort = imageFiles.length;
        for (const file of files) {
            const imageDetail = await getImageFileDetail(file);
            newFiles.push({
                id: Math.random().toString(36).slice(2),
                file_id: null,
                file,
                url: URL.createObjectURL(file),
                width: imageDetail.width,
                height: imageDetail.height,
                upload_status: 'pending',
                sort: sort++
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
        setValue('title', null);
        setTimeout(() => {
            setFocus(titleInputHidden ? 'title' : 'content');
        }, 10);
    };

    const handleOnImageClick = () => {
        setEditImagesOpen(true);
    }

    const handleOnImagesChange = (images: PostImage[]) => {
        //console.log({ images });
        setImageFiles(images);
    }

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const getImageDimensions = async (image: PostImage) => {
            if ('file' in image) {
                const { width, height } = await getImageFileDetail(image.file);
                return { width, height };
            }

            return {
                width: image.width,
                height: image.height
            };
        };

        const run = async () => {
            if (imageFiles.length === 0) return;
            const dimensions = await Promise.all(imageFiles.map(getImageDimensions));
            if (cancelled) return;

            //if image is 4 or less, just use the first image's orientation
            if (dimensions.length < 4) {
                setOrientation(getDimensionOrientation(dimensions[0].width, dimensions[0].height));
                return;
            }

            //more than 4, count which orientation is dominant
            const count: Record<ImageOrientation, number> = { landscape: 0, portrait: 0, square: 0, unknown: 0 };
            dimensions.forEach(({ width, height }) => {
                const o = getDimensionOrientation(width, height);
                if (o === 'landscape' || o === 'portrait') { count[o]++; }
            });

            //get the key (portrait/landscape) with highest count, ex. [0][0] is ['landscape', 3] (after Object.entries)
            const dominant = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0] as ImageOrientation;
            setOrientation(dominant === 'portrait' ? 'landscape' : 'portrait');
        };
        run();

        return () => {
            cancelled = true;
        };
    }, [imageFiles]);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => { setFocus('content'); }, 10);
        scrollbarWidthAware(true);

        return () => {
            clearTimeout(timer);
            scrollbarWidthAware(false);
        }
    }, [open, setFocus]);

    useEffect(() => {
        if (!post || !open) return;
        reset({
            title: post.title ?? null,
            content: post.content
        });

        setTitleInputHidden(!post.title);
        setImageFiles(post.images);
        return () => {
            reset();
            setImageFiles([]);
            setErrorMessage('');
            setTitleInputHidden(true);
        };
    }, [post?.id, open]);

    const collageImages = useMemo(() => {
        return imageFiles.map(v => ({
            width: v.width,
            height: v.height,
            url: v.url,
            id: v.id
        } as CollageImage));
    }, [imageFiles]);

    return (<>
        <Dialog
            className={'create-post-dialog'}
            open={open}
            onClose={closeDialog}
            scroll="paper"
            transitionDuration={0}
            fullWidth
            disableScrollLock
        >
            <DialogTitle textAlign="center">{post ? 'Edit post' : 'Create post'}</DialogTitle>
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
                            <ImageCollage
                                orientation={orientation}
                                images={collageImages}
                                onImageClick={handleOnImageClick}
                            />
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
                        >{post ? 'Save' : 'Post'}</Button>
                        {errorMessage && <Typography color="error" textAlign="center">{errorMessage}</Typography>}
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>

        <EditPostImagesDialog
            open={editImagesOpen}
            images={imageFiles}
            closeDialog={() => setEditImagesOpen(false)}
            onChange={handleOnImagesChange}
        />
    </>
    );
};