import { apiGet, apiPost } from '@/api/apiClient';
import { ResetPasswordForm, type FormInput } from '@/components/ResetPasswordForm';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ApiResult } from '@shared/types/ApiResult';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

export function ResetPasswordPage() {
    const { token_hash } = useParams();
    const [step, setStep] = useState<'checking_token' | 'reset_password' | 'success' | 'token_error'>('checking_token');

    const onSubmit = async (formInput: FormInput) => {
        const res = await apiPost(`/users/reset-password`, { ...formInput, token_hash: token_hash! });
        return res; //return to show error message on form
    };

    const onResetPasswordSuccess = (result: ApiResult<unknown>) => {
        if (result.ok) setStep('success');
    }

    useEffect(() => {
        const run = async () => {
            const res = await apiGet('/users/reset-password', { token_hash: token_hash! });
            setStep(res.ok ? 'reset_password' : 'token_error');
        }
        run();
    }, [token_hash]);

    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            minHeight={'100%'}
            height={'70vh'}
            mt={'60px'}
        >
            <Paper elevation={0} sx={{ p: 6, maxWidth: 400, mx: 'auto' }}>
                {step == 'checking_token'
                    && <Stack direction={'row'} alignItems={'center'} gap={2}>
                        <CircularProgress />
                        <Typography> Checking token. Please wait...</Typography>
                    </Stack>
                }

                {step == 'reset_password'
                    && <ResetPasswordForm
                        onSubmit={onSubmit}
                        onResetPasswordSuccess={onResetPasswordSuccess}
                    />
                }

                {step == 'token_error'
                    && <Stack gap={1}>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Unable to reset password</Typography>
                        <Typography>The password reset token is either invalid, expired, or already used.</Typography>
                        <Link component={RouterLink} to="/forgot-password" textAlign={'center'} mt={1}>Return to account recovery</Link>
                    </Stack>
                }

                {step == 'success'
                    && <Stack gap={1}>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Password updated</Typography>
                        <Typography>Your password has been successfully updated.</Typography>
                        <Link component={RouterLink} to="/signin" textAlign={'center'} mt={1}>Sign-in with your new password</Link>
                    </Stack>
                }
            </Paper>
        </Box>
    );
}