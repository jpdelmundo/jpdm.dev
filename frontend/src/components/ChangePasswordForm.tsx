import { getErrorMessage } from '@/utils/helper';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ChangePasswordFormInput } from '@shared/types/ChangePasswordFormInput';
import { validatePassword as _validatePassword } from '@shared/utils/validation';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { TransitionGroup } from 'react-transition-group';
import PasswordField from './PasswordField';

type Props = {
    onCompleted: () => void;
    onSubmit: (formInput: ChangePasswordFormInput) => Promise<ApiResult<never>>;
}

export function ChangePasswordForm({ onSubmit, onCompleted }: Props) {
    const { register, handleSubmit, setError, formState: { errors }, watch } = useForm<ChangePasswordFormInput>();
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const newPassword = watch('new_password', '');

    useEffect(() => {
        if (!newPassword) setPasswordErrors([]);
    }, [newPassword]);

    const validatePassword = (value: string) => {
        const errors = _validatePassword(value);
        setPasswordErrors(errors);
        return errors.length == 0 || 'Password does not meet requirements';
    }

    const submitHandler: SubmitHandler<ChangePasswordFormInput> = async (data) => {
        setErrorMessage('');
        setIsSubmitting(true);
        const result = await onSubmit(data);
        if (result.ok) {
            onCompleted();
        } else {
            setErrorMessage(getErrorMessage(result));
        }
        setIsSubmitting(false);
    }

    console.log({ passwordErrors });

    return (
        <form noValidate onSubmit={handleSubmit(submitHandler)}>
            <Stack gap={2}>
                <PasswordField label="Old Password"
                    {...register('old_password', {
                        required: 'Old password is required',
                    })}
                    placeholder=""
                    error={!!errors.old_password}
                    helperText={errors.old_password?.message}
                    fullWidth
                    autoFocus />
                <PasswordField label="New Password"
                    {...register('new_password', {
                        required: 'New password is required',
                        validate: validatePassword
                    })}
                    placeholder=""
                    error={!!errors.new_password}
                    helperText={errors.new_password?.message}
                    fullWidth />
                <TransitionGroup style={{ display: passwordErrors.length > 0 ? 'block' : 'none' }}>
                    {passwordErrors.map(error => (
                        <Collapse key={error} timeout={300}>
                            <Stack direction="row" color="error.main" alignItems="center" margin={'0 10px'}>
                                <CloseIcon fontSize="small" /> <span>{error}</span>
                            </Stack>
                        </Collapse>
                    ))}
                </TransitionGroup>
                <PasswordField label="Confirm New Password"
                    {...register('confirm_password', {
                        required: 'Please confirm password',
                        validate: (value: string) => newPassword == value || 'Passwords don\'t match'
                    })}
                    error={!!errors.confirm_password}
                    helperText={errors.confirm_password?.message}
                    fullWidth />
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <Stack direction="row" alignItems="center" gap={1}><CircularProgress /> <span>Processing...</span></Stack> : 'Submit'}
                </Button>
                {errorMessage && <Typography color="error" textAlign="center">{errorMessage}</Typography>}
            </Stack>
        </form>
    );
}