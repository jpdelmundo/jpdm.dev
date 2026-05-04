import { apiDelete, apiPost, apiPut } from "@/api/apiClient";
import { Avatar } from "@/components/Avatar";
import { DatePicker } from "@/components/DatePicker";
import { Dialog } from "@/components/Dialog";
import { Select } from "@/components/Select";
import TextField from "@/components/TextField";
import { useAvatarProps } from "@/hooks/useAvatarProps";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserProfileStore } from "@/store/useUserProfileStore";
import { getFingerprint } from "@/utils/device";
import { formatDateTime, getErrorMessage } from "@/utils/helper";
import ClearRounded from '@mui/icons-material/ClearRounded';
import FileUploadRounded from '@mui/icons-material/FileUploadRounded';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from '@mui/material/Container';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid, { type GridProps } from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { File as FileModel } from "@shared/models/generated/File";
import type { UserProfile } from "@shared/models/generated/UserProfile";
import { Gender, genderText } from "@shared/types/Gender";
import { jsonBase64Encode } from "@shared/utils/encoding";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

const GridRow = (props: GridProps) => {
    return <Grid container size={{ xs: 12 }} {...props} />
}

// const GridCell = (props: GridProps) => {
//     return <Grid size={{ xs: 12, sm: 6 }} {...props} />
// }

const colLabel = { size: { xs: 12, sm: 6 } };
const colData = { size: { xs: 12, sm: 6 } };

type FormInput = {
    first_name: string | null;
    last_name: string | null;
    gender: Gender | null;
    bio: string | null;
    date_of_birth: Dayjs | null;
    phone_number: string | null;
}

export const ProfilePage = () => {
    //console.trace('ProfilePage rendered');
    const user = useAuthStore(s => s.user);
    const userProfile = useUserProfileStore(s => s.userProfile);
    const fetchProfile = useUserProfileStore(s => s.fetchProfile);
    const avatarProps = useAvatarProps();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { register, handleSubmit, control, reset, setFocus } = useForm<FormInput>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [avatarErrorMessage, setAvatarErrorMessage] = useState('');
    const [avatarIsDragging, setAvatarIsDragging] = useState(false);
    const [avatarIsUploading, setAvatarIsUploading] = useState(false);
    const avatarDragCounter = useRef(0);
    const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
    const [avatarSrc, setAvatarSrc] = useState(avatarProps?.avatar_url);
    const theme = useTheme();
    const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

    const editOnClick = () => {
        setDialogOpen(true);
    }

    const dialogOnClose = () => {
        setDialogOpen(false);
        setErrorMessage('');
    }

    const submitHandler: SubmitHandler<FormInput> = async (data) => {
        setIsSubmitting(true);
        const result = await apiPut<UserProfile>(`/profile/${user!.id}`, { ...data, date_of_birth: data.date_of_birth?.toISOString() || '' });
        if (result.ok) {
            fetchProfile(user!.id);
            dialogOnClose();
        } else {
            setErrorMessage(getErrorMessage(result));
        }
        setIsSubmitting(false);
    }

    const cancelOnClick = () => {
        dialogOnClose();
    }

    const uploadFile = async (file: File) => {
        setAvatarErrorMessage('');
        if (file) {
            //console.log({ type: file.type });
            if (!file.type.startsWith('image/')) return;
            const url = URL.createObjectURL(file);
            setAvatarSrc(url);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fp', jsonBase64Encode(getFingerprint()));
            formData.append('type', 'avatar');
            const onProgress = (progress: number) => setAvatarUploadProgress(progress);
            setAvatarIsUploading(true);
            const result = await apiPost<FileModel>(`/profile/${user!.id}/avatar`, formData, onProgress);
            setAvatarUploadProgress(0);
            setAvatarIsUploading(false);
            if (result.ok) {
                fetchProfile(user!.id);
            } else {
                setAvatarErrorMessage(getErrorMessage(result));
            }
        }
    }

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
            e.target.value = '';
        }
    }

    const photoOnEdit = () => inputFileRef.current?.click();

    const avatarOnDragOver = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);
    const avatarOnDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        avatarDragCounter.current += 1;
        if (avatarDragCounter.current === 1) setAvatarIsDragging(true);
    }, []);
    const avatarOnDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        avatarDragCounter.current -= 1;
        if (avatarDragCounter.current === 0) setAvatarIsDragging(false);
    }, []);
    const avatarOnDrop = useCallback((e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        avatarDragCounter.current = 0;
        setAvatarIsDragging(false);
        //console.log(e.dataTransfer.files[0]);
        uploadFile(e.dataTransfer.files[0]);
    }, []);

    const photoOnDeleteClick = async () => {
        setAvatarSrc('');
        const result = await apiDelete(`/profile/${user!.id}/avatar`);
        if (result.ok) {
            fetchProfile(user!.id);
        }
    }

    useEffect(() => {
        if (dialogOpen) setTimeout(() => setFocus('first_name'), 100);
    }, [dialogOpen]);

    useEffect(() => {
        reset({
            first_name: userProfile?.first_name,
            last_name: userProfile?.last_name,
            date_of_birth: userProfile?.date_of_birth ? dayjs(userProfile?.date_of_birth) : null,
            gender: (userProfile?.gender || '') as Gender,
            phone_number: userProfile?.phone_number,
            bio: userProfile?.bio,
        });
        setAvatarSrc(userProfile?.avatar_url || '');
    }, [userProfile]);

    return <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
        <Paper
            elevation={0}
            className="page"
            onDragOver={avatarOnDragOver}
            onDragEnter={avatarOnDragEnter}
            onDragLeave={avatarOnDragLeave}
            onDrop={avatarOnDrop}
            sx={{
                border: avatarIsDragging ? 'dashed 5px #dddddd' : 'solid 5px #dddddd00'
            }}
        >
            <Stack mb={2} direction={'row'}>
                <Typography variant="h5" fontWeight={'bold'}>Profile</Typography>
            </Stack>
            <Stack gap="25px" alignItems={'center'}>
                <Stack gap={'10px'} alignItems={'center'}>
                    <Box sx={{ position: 'relative' }}>
                        {avatarIsUploading && <CircularProgress
                            variant="determinate"
                            value={avatarUploadProgress}
                            sx={{
                                position: 'absolute',
                                zIndex: 1,
                                opacity: 0.8,
                                color: '#ffffff'
                            }}
                            size={isSmUp ? 160 : 120}
                            enableTrackSlot
                        />}
                        <Avatar
                            onClick={photoOnEdit}
                            {...avatarProps}
                            sx={{
                                fontSize: { xs: '50px', sm: '80px' },
                                aspectRatio: 1,
                                width: { xs: '120px', sm: '160px' },
                                height: 'auto',
                                cursor: 'pointer',
                                opacity: avatarIsUploading ? 0.7 : 1
                            }}
                            src={avatarSrc}
                        />
                        <Stack sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '50%',
                            '&:hover': !avatarIsUploading ? {
                                bgcolor: 'rgb(0, 0, 0, 0.5)',
                                '& .controls': {
                                    display: 'flex'
                                }
                            } : {}
                        }}
                            direction={'row'}
                            gap={1}>
                            <Box className="controls" display={'none'} gap={5}>
                                <IconButton
                                    sx={{
                                        bgcolor: '#eeeeee',
                                        border: 'solid 1px #dddddd',
                                        borderRadius: '50%',
                                        padding: '5px',
                                        '&:hover': {
                                            bgcolor: '#ffffff'
                                        }
                                    }}
                                    onClick={photoOnEdit}
                                >
                                    <FileUploadRounded sx={{
                                        width: '30px',
                                        height: 'auto'
                                    }} />
                                </IconButton>
                                {avatarSrc && <IconButton
                                    sx={{
                                        bgcolor: '#bb0000',
                                        color: '#ffffff',
                                        borderRadius: '50%',
                                        padding: '5px',
                                        '&:hover': {
                                            bgcolor: '#d80000'
                                        }
                                    }}
                                    onClick={photoOnDeleteClick}
                                >
                                    <ClearRounded sx={{
                                        width: '30px',
                                        height: 'auto'
                                    }} />
                                </IconButton>}
                            </Box>
                        </Stack>
                    </Box>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        ref={inputFileRef}
                        style={{ display: 'none' }}
                    />
                    <Stack>
                        <Button size="small" variant="text" onClick={photoOnEdit}>Change photo</Button>
                        {avatarErrorMessage && <Typography color="error" textAlign="center">{avatarErrorMessage}</Typography>}
                    </Stack>
                </Stack>
                <Stack maxWidth={'300px'} gap="10px">
                    <Grid container>
                        <GridRow mb="10px">
                            <Grid {...colLabel}><Typography color="grey">Name</Typography></Grid>
                            <Grid  {...colData}>{userProfile?.first_name ? `${userProfile?.first_name} ${userProfile?.last_name}` : 'Not set'}</Grid>
                        </GridRow>
                        <GridRow mb="10px">
                            <Grid {...colLabel}><Typography color="grey">Birthday</Typography></Grid>
                            <Grid {...colData}>{userProfile?.date_of_birth ? formatDateTime(userProfile.date_of_birth, navigator.language, { date_only: true }) : 'Not set'}</Grid>
                        </GridRow>
                        <GridRow mb="10px">
                            <Grid {...colLabel}><Typography color="grey">Gender</Typography></Grid>
                            <Grid {...colData}>{userProfile?.gender ? genderText((userProfile.gender) as Gender) : 'Not set'}</Grid>
                        </GridRow>
                        <GridRow mb="10px">
                            <Grid {...colLabel}><Typography color="grey">Phone</Typography></Grid>
                            <Grid  {...colData}>{userProfile?.phone_number ? `${userProfile.phone_number}` : 'Not set'}</Grid>
                        </GridRow>
                        <GridRow mb="10px">
                            <Grid {...colLabel}><Typography color="grey">About You</Typography></Grid>
                            <Grid {...colData}>{userProfile?.bio ? `${userProfile.bio}` : 'Not set'}</Grid>
                        </GridRow>
                    </Grid>
                    <Button size="small" variant="text" onClick={editOnClick}>Edit</Button>
                </Stack>
            </Stack>

            <Dialog
                open={dialogOpen}
                onClose={dialogOnClose}>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogContent>
                    <form id="profile-form"
                        noValidate
                        onSubmit={handleSubmit(submitHandler)}>
                        <Stack gap={2}>
                            <TextField label="First name"
                                {...register('first_name')}
                                fullWidth />
                            <TextField label="Last name"
                                {...register('last_name')}
                                fullWidth />
                            <Stack direction={'row'} gap={2}>
                                <Stack flex={1} width={'50%'}>
                                    <Select
                                        label="Gender"
                                        control={control}
                                        fullWidth
                                        {...register('gender')}
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
                                        name="date_of_birth"
                                    />
                                </Stack>
                            </Stack>
                            <Stack>
                                <TextField label="Phone Number"
                                    {...register('phone_number')}
                                    fullWidth />
                            </Stack>
                            <Stack>
                                <TextField label="About You"
                                    multiline
                                    rows={3}
                                    {...register('bio')}
                                />
                            </Stack>
                        </Stack>
                    </form>
                </DialogContent>
                <DialogActions sx={{ padding: '25px' }}>
                    <Stack gap={1} flex={1}>
                        <Stack direction={'row'} justifyContent={'end'} gap={1}>
                            <Button
                                variant="text"
                                onClick={cancelOnClick}
                                size="small"
                            >Cancel</Button>
                            <Button
                                type="submit"
                                form="profile-form"
                                loading={isSubmitting}
                                variant="contained"
                                size="small"
                            >Save</Button>
                        </Stack>
                        {errorMessage && <Typography color="error" textAlign="center">{errorMessage}</Typography>}
                    </Stack>
                </DialogActions>
            </Dialog>
        </Paper>
    </Container>
}