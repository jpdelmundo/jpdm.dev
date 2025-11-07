import { Box, Button, Typography } from '@mui/material';
import { useForm, type SubmitHandler } from 'react-hook-form';
import TextField from './TextField';

export type FormData = {
    title: string | null;
    content: string;
};

export function CreatePostForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const onSubmit: SubmitHandler<FormData> = (data) => console.log({ data });

    return (
        <Box className="post-form">
            <Typography variant="h5" fontWeight="bold" mb={2}>Create new post </Typography>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <TextField label="Post Title" {...register('title', { maxLength: { value: 100, message: 'Title max length: 100 chars' } })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    fullWidth />
                <TextField
                    label="Post Body"
                    multiline
                    {...register('content', { required: 'Post Body is required', maxLength: 100 })}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    fullWidth />
                <Button type="submit" variant="contained">Post</Button>
            </form>
        </Box>
    );
}