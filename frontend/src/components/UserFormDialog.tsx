import { apiPost, apiPut } from '@/api/apiClient.ts';
import { useConfirmStore } from '@/store/useConfirmStore.ts';
import { useSnackbarStore } from '@/store/useSnackbarStore.ts';
import { copyToClipboard } from '@/utils/helper.ts';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { UserDTO } from '@shared/models/dto/UserDTO.ts';
import { Gender } from '@shared/types/Gender.ts';
import { validateEmail } from '@shared/utils/validation.ts';
import { useState } from 'react';
import { useForm, type Path, type SubmitHandler } from 'react-hook-form';
import { DatePicker } from './DatePicker.tsx';
import { Dialog } from './Dialog.tsx';
import { Select } from './Select.tsx';
import TextField from './TextField.tsx';

// type FormInput = {
//     username: string;
//     email: string;
//     first_name: string | null;
//     last_name: string | null;
//     gender: Gender | null;
//     bio: string | null;
//     date_of_birth: Dayjs | null;
//     phone_number: string | null;
// }

type Props = {
    data: UserDTO;
    onClose: () => void,
    onUpdated: (data: UserDTO) => void
}

export const UserFormDialog = ({ data, onClose, onUpdated }: Props) => {
    const showMessage = useSnackbarStore(s => s.showMessage);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { handleSubmit, register, control, formState: { errors }, setError } = useForm<UserDTO>({ defaultValues: data });
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const confirm = useConfirmStore(s => s.confirm);

    const submitHandler: SubmitHandler<UserDTO> = async (formData) => {
        const profileId = data.profile?.id;
        const { email, profile } = formData;
        const { first_name, last_name, date_of_birth, bio, phone_number, gender } = profile || {};
        setIsSubmitting(true);
        const result = await apiPut<UserDTO>('/users', {
            ids: [formData.id],
            email,
            profile: {
                id: profileId,
                first_name, last_name, bio, phone_number, gender,
                ...(date_of_birth && { date_of_birth: date_of_birth.toISOString() })
            }
        });
        setIsSubmitting(false);
        if (result.ok && result.data) {
            onUpdated(result.data);
            onClose();
        } else {
            if (result.error) {
                const data = result.error.data as { param: string };
                setError(data.param as Path<UserDTO>, { type: 'manual', message: result.error.message }, { shouldFocus: true });
                showMessage(result.error.message);
            }
        }
    }

    const handleSetTempPassword = async () => {
        const confirmed = await confirm({ message: 'This action will set a temporary password for the user\'s account. Proceed?', confirmText: 'Proceed' });

        if (confirmed) {
            setResetPasswordOpen(true);
            setResetPasswordLoading(true);
            const result = await apiPost<{ password: string }>(`/users/${data.id}/set-temp-password`);
            if (result.ok) {
                setTempPassword(result.data?.password || '');
            }
            setResetPasswordLoading(false);
        }
    }

    const handlePasswordResetLink = () => {

    }

    const copyTempPasswordToClipboard = async () => {
        await copyToClipboard(tempPassword);
        showMessage(<Box display={'flex'} alignItems={'center'} gap={1}><CheckCircleRounded fontSize="small" />Copied temp password to clipboard</Box>);
    }

    return <>
        <Dialog
            open={data !== null}
            onClose={onClose}
        >
            <DialogTitle>User</DialogTitle>
            <DialogContent>
                <form
                    id="user"
                    noValidate
                    onSubmit={handleSubmit(submitHandler)}>
                    <Stack gap={2}>
                        <TextField label="Username"
                            placeholder=""
                            fullWidth
                            value={data.username}
                            disabled
                        />
                        <TextField label="Email"
                            {...register('email', {
                                validate: value => {
                                    if (!value) return;
                                    const errors = validateEmail(value);
                                    return errors.length == 0 || errors[0];
                                }
                            })}
                            error={!!errors.email}
                            //helperText={errors.email?.message}
                            fullWidth
                        />
                        <TextField label="First name" {...register('profile.first_name')} fullWidth />
                        <TextField label="Last name" {...register('profile.last_name')} fullWidth />
                        <Stack direction={'row'} gap={2}>
                            <Stack flex={1} width={'50%'}>
                                <Select
                                    label="Gender"
                                    control={control}
                                    name="profile.gender"
                                    fullWidth
                                >
                                    {Object.values(Gender).map(item => (
                                        <MenuItem key={item.value} value={item.value}>{item.text}</MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                            <Stack flex={1} width={'50%'} gap="4px">
                                <DatePicker
                                    label="Birthday"
                                    control={control}
                                    name="profile.date_of_birth"
                                />
                            </Stack>
                        </Stack>
                        <Stack>
                            <TextField label="Phone Number"
                                {...register('profile.phone_number')}
                                fullWidth />
                        </Stack>
                        <Stack>
                            <TextField label="About You"
                                multiline
                                rows={3}
                                {...register('profile.bio')}
                            />
                        </Stack>
                        <Stack direction={'row'} justifyContent={'flex-end'} gap={1}>
                            <Link component="button" type="button" onClick={handleSetTempPassword}>Reset Password</Link>
                            {data.email && <Link component="button" type="button" onClick={handlePasswordResetLink}>Send Password Reset Link</Link>}
                        </Stack>
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ padding: '25px' }}>
                <Stack direction={'row'} justifyContent={'flex-end'} gap={1}>
                    <Button onClick={onClose} size="small" >Cancel</Button>
                    <Button type="submit" variant="contained" form="user" loading={isSubmitting} size="small">Save</Button>
                </Stack>
            </DialogActions>
        </Dialog>

        <Dialog
            open={resetPasswordOpen}
            onClose={() => setResetPasswordOpen(false)}
        >
            <DialogTitle>Temp Password</DialogTitle>
            <DialogContent sx={{ padding: 0 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px'
                }}>
                    {resetPasswordLoading
                        ? <CircularProgress />
                        : <Box>
                            <TextField
                                value={tempPassword}
                                sx={{ mb: '10px' }}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton tabIndex={-1} edge="end" onClick={copyTempPasswordToClipboard} >
                                                    <ContentCopyRoundedIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            '& input': {
                                                textAlign: 'center'
                                            }
                                        }
                                    }
                                }} />
                            <Typography>User will be prompted to change password upon logging in.</Typography>
                        </Box>
                    }
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: '25px' }}>
                <Button onClick={() => setResetPasswordOpen(false)} size="small" variant="contained" >Close</Button>
            </DialogActions>
        </Dialog>
    </>
}