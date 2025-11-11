import { apiPost } from '@/api/apiClient';
import { getFingerprint } from '@/utils/device';
import { getErrorMessage } from '@/utils/helper';
import type PostExtended from '@shared/models/extensions/PostExtended';
import type { File as FileModel } from '@shared/models/generated/File';
import type { ApiResult } from '@shared/types/ApiResult';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useRef, useState, type ChangeEvent, type MouseEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type UploadFile = {
    file: File;
    preview: string;
    clientId: string;
    fileId: string | null;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'error'
}

export type FormInput = {
    title: string | null;
    content: string;
};

export function CreatePostForm({ onSuccess }: {
    onSuccess: (result: ApiResult<PostExtended>) => void
}) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>();
    const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit: SubmitHandler<FormInput> = async (data) => {
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
                        formData.append('fingerprint', jsonBase64Encode(getFingerprint()));
                        const result = await apiPost<FileModel>('/file/upload', formData);
                        if (!result.ok || !result.data?.id) throw Error(`Upload failed: ${result.error?.message}`);

                        const fileId = result.data.id;
                        setImageFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], uploadStatus: 'completed', fileId };
                            return updated;
                        });

                        uploadedImages.push({
                            fileId,
                            sort: i
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
                        sort: i
                    });
                }
            }

            //create the post with image ids
            const result = await apiPost<PostExtended>('/post/create', { ...data, files: uploadedImages });
            if (result.ok) {
                reset();
                setImageFiles([]);
                setErrorMessage('');
                uploadedImages.length = 0;
                onSuccess && onSuccess(result);
            } else {
                setErrorMessage(getErrorMessage(result));
            }
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newFiles: UploadFile[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            clientId: Math.random().toString(36).slice(2),
            fileId: null,
            uploadStatus: 'pending'
        }));

        setImageFiles(prev => {
            return ([
                ...prev,
                ...newFiles
            ]);
        });

        console.log({ imageFiles });

        e.target.value = '';
    }

    return (
        <Paper className="post-form">
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <TextField label=""
                    placeholder="Add title here"
                    {...register('title')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    fullWidth
                />
                <TextField
                    label=""
                    placeholder="What's on your mind?"
                    multiline
                    {...register('content', { required: 'Post Body is required', maxLength: { value: 200000, message: 'Content exceeds maximum length' } })}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    fullWidth
                />
                <Box display={imageFiles.length == 0 ? 'none' : 'block'} sx={{ aspectRatio: '1 / 1' }}>
                    <Grid container>
                        {imageFiles.map(image => (
                            <Grid key={image.clientId}>
                                <img
                                    src={image.preview}
                                    style={{ objectFit: 'cover', width: '100%', height: '100px', display: 'block' }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        ref={inputFileRef}
                        style={{ display: 'none' }}
                    />

                    <IconButton
                        color="primary"
                        onClick={(_: MouseEvent<HTMLButtonElement>) => inputFileRef.current?.click()}
                        disableRipple
                        sx={{ py: 0 }}>
                        <AddPhotoAlternate fontSize="large" />
                    </IconButton>
                </Box>
                <Box>
                    <Button type="submit" variant="contained" disabled={isSubmitting} loading={isSubmitting}>Post</Button>
                    <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>
                </Box>
            </form>
        </Paper>
    );
}