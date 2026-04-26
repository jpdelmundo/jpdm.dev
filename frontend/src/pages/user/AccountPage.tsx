import { apiDelete, apiGet } from '@/api/apiClient';
import { Error } from '@/components/Error';
import PasswordField from '@/components/PasswordField';
import { PageLoading } from '@/components/skeleton/PageLoading';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDateTime, getErrorMessage, scrollbarWidthAware } from '@/utils/helper';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { MeDTO } from '@shared/models/dto/MeDTO';
import type { ApiErrorDetail } from '@shared/types/ApiResult';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const boxProps = { padding: '10px 25px', margin: '10px 0' };

export const AccountPage = () => {
    const user = useAuthStore(s => s.user);
    const signOut = useAuthStore(s => s.signOut);
    const [data, setData] = useState<MeDTO | null>(null);
    const [error, setError] = useState<ApiErrorDetail | null>(null);
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const getData = async () => {
        if (!user) return;
        const result = await apiGet<MeDTO>(`/users/me`);
        if (result.ok && result.data) {
            setData(result.data);
        } else {
            if (result.error) setError(result.error);
        }
    }

    const updateEmailOnClick = () => {
        navigate('/user/update-email');
    }

    const changePasswordOnClick = () => {
        navigate('/user/change-password');
    }

    const deleteOnClick = () => {
        scrollbarWidthAware(true);
        setDialogOpen(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 200);
    }

    const dialogDeleteOnClick = async () => {
        if (data?.has_password) {
            const password = inputRef.current?.value || '';
            if (!password) {
                inputRef.current?.focus();
                return setPasswordError(true);
            }
            setDeleteError('');
            setProcessing(true);
            const result = await apiDelete(`/users/${user?.id}`, { password });
            setProcessing(false);
            if (result.ok) {
                signOut();
                closeDeleteDialog();
            } else {
                setDeleteError(getErrorMessage(result));
            }
        } else if (data?.social_login) {
            //const authUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/${data?.social_login}?fp=${jsonBase64Encode(getFingerprint())}&intent=get_delete_token`;
            //const authWindow = window.open(authUrl, 'reauth', 'width=500,height=600');

            window.addEventListener('message', async (event: MessageEvent<unknown>) => {
                if (event.origin != `${import.meta.env.VITE_API_BASE_URL}`) return;
                console.log({ event });
                const { token } = (event.data as Record<string, string>);

                setDeleteError('');
                setProcessing(true);
                const result = await apiDelete(`/users/${user?.id}`, { token });
                setProcessing(false);
                if (result.ok) {
                    signOut();
                    closeDeleteDialog();
                } else {
                    setDeleteError(getErrorMessage(result));
                }
            });
        }
    }

    const closeDeleteDialog = () => {
        setDialogOpen(false);
        scrollbarWidthAware(false);
    }

    useEffect(() => {
        getData();
    }, [user]);

    if (!data) return <PageLoading />;
    if (error) return <Error error={error} />;

    return <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
        <Paper elevation={0} className="page">
            <Box mb={2}>
                <Typography variant="h5" fontWeight={'bold'}>Account & Security</Typography>
                <Typography fontSize={'small'} color="textDisabled">Created on {formatDateTime(data.created_at)}</Typography>
            </Box>
            <Typography>Email</Typography>
            <Box {...boxProps}>
                {
                    user?.email
                        ? <Stack gap={1}>
                            <Stack direction={'row'} gap={1}><MailOutlineRounded />  <Typography>{user?.email}</Typography></Stack>
                            <Box><Button variant="contained" size="small" sx={{ width: '150px' }} onClick={updateEmailOnClick}>Change email</Button></Box>
                        </Stack>
                        : <Button variant="contained" size="small" sx={{ width: '150px' }} onClick={updateEmailOnClick}>Add email</Button>
                }
            </Box>
            <Typography>Password</Typography>
            <Box {...boxProps}>
                <Button variant="contained" size="small" sx={{ width: '150px' }} onClick={changePasswordOnClick}>Change password</Button>
            </Box>
            <Typography>Delete account</Typography>
            <Box {...boxProps}>
                <Button variant="contained" size="small" color="error" sx={{ width: '150px' }} onClick={deleteOnClick}>Delete</Button>
            </Box>

            <Dialog
                disableScrollLock
                transitionDuration={0}
                open={dialogOpen}
                onClose={closeDeleteDialog}
                fullWidth
                maxWidth="xs">
                <DialogTitle> Are you sure you want to delete your account?</DialogTitle>
                <DialogContent>
                    <Stack gap={2}>
                        <Alert severity="warning" sx={{ fontSize: '16px' }} icon={<WarningRoundedIcon />}>Deleting your account may also delete all of your submitted content.</Alert>
                        {data?.has_password
                            && <>
                                <Typography>To proceed, enter your password in the input box below then click the Delete button.</Typography>
                                <PasswordField inputRef={inputRef} sx={{ alignSelf: 'center', display: data?.has_password ? '' : 'none' }} error={passwordError} />
                            </>
                        }
                        {!data?.has_password && data?.social_login && <Typography>A popup window will open when you click the "Delete Account" button to confirm your identity.</Typography>}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ padding: '25px' }}>
                    <Stack>
                        <Stack direction="row" alignItems={'end'} gap={1}>
                            <Button size="small" onClick={closeDeleteDialog}>Cancel</Button>
                            <Button variant="contained" color="error" size="small" onClick={dialogDeleteOnClick} loading={processing}>Delete Account</Button>
                        </Stack>
                        {deleteError && <Typography color="error" textAlign={'right'} mt={2}>{deleteError}</Typography>}
                    </Stack>
                </DialogActions>
            </Dialog>
        </Paper>
    </Container>
}