import { apiPost } from "@/api/apiClient";
import { UpdateEmailForm } from "@/components/UpdateEmailForm";
import { useAuthStore } from "@/store/useAuthStore";
import { getErrorMessage } from "@/utils/helper";
import Box from "@mui/material/Box";
import Container from '@mui/material/Container';
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ApiResult } from "@shared/types/ApiResult";
import type { EmailFormInput } from "@shared/types/EmailFormInput";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

export const UpdateEmailAccountPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const refreshToken = useAuthStore(s => s.refreshToken);
    const [errorMessage, setErrorMessage] = useState('');
    const [step, setStep] = useState<'form' | 'success'>('form');

    const emailSubmit = async (formInput: EmailFormInput): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/users/email-code', formInput);
        return res; //return to show error message on form
    }

    const codeSubmit = async (formInput: EmailFormInput): Promise<ApiResult<never>> => {
        const res = await apiPost<never>('/users/email-code-confirm', formInput);
        return res; //return to show error message on form
    }

    const emailConfirmed = async (result: ApiResult<never>) => {
        if (result.ok) {
            setStep('success');
        } else {
            setErrorMessage(getErrorMessage(result));
        }
    }

    const accountOnClick = async () => {
        await refreshToken();
        navigate('/user/account');
    }

    return <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
        ><Paper sx={{ p: 6, maxWidth: 400 }}>
                <Stack sx={{ maxWidth: 400 }}>
                    {step == 'form' && <Stack>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Add email to account</Typography>
                        <UpdateEmailForm onEmailSubmit={emailSubmit} onCodeSubmit={codeSubmit} onEmailConfirmed={emailConfirmed} email={user?.email || ''} />
                        <Link component={RouterLink} to="/user/account" textAlign={'center'} mt={2}>Cancel</Link>
                    </Stack>}
                    {step == 'success' && <Stack>
                        <Typography variant="h5" fontWeight="bold" mb={1}>Email added to account</Typography>
                        <Typography mb={1}>Successfully added the email to your account:</Typography>
                        <Typography mb={2} textAlign={'center'} fontWeight="bold">{user?.email}</Typography>
                        <Link component="button" textAlign={'center'} mt={2} onClick={accountOnClick}>Return to account page</Link>
                    </Stack>}
                    {errorMessage && <Typography color="error" textAlign="center" minHeight="21px">{errorMessage}</Typography>}
                </Stack>
            </Paper>
        </Box>
    </Container>
}