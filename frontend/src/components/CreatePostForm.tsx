import { apiPost } from '@/api/apiClient';
import { getFingerprint } from '@/utils/device';
import { AddPhotoAlternate } from '@mui/icons-material';
import { Box, Button, Grid, IconButton, Paper } from '@mui/material';
import type { default as FileModel } from '@shared/models/generated/File';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useRef, useState, type ChangeEvent, type MouseEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

type UploadFile = {
    file: File;
    preview: string;
    clientId: string;
    fileId: string | null;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'error'
}

export type FormData = {
    title: string | null;
    content: string;
};

export function CreatePostForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setSubmitting(true);

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
                    } catch (error) {
                        setImageFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], uploadStatus: 'error' };
                            return updated;
                        });
                        throw error;
                    }

                } else if (imageFile.uploadStatus == 'completed') {
                    uploadedImages.push(imageFile);
                }
            }

        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newFiles: UploadFile[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            clientId: Math.random().toString(36).slice(2),
            serverId: null,
            uploadStatus: 'pending'
        }));
        console.log({ newFiles });
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
                        onClick={(e: MouseEvent<HTMLButtonElement>) => inputFileRef.current?.click()}
                        disableRipple
                        sx={{ py: 0 }}>
                        <AddPhotoAlternate fontSize="large" />
                    </IconButton>
                </Box>
                <Box textAlign="right">
                    <Button type="submit" variant="contained">Post</Button>
                </Box>
            </form>
        </Paper>
    );
}