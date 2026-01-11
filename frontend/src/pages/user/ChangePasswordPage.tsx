import { apiPut } from "@/api/apiClient";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { useAuthStore } from "@/store/useAuthStore";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ChangePasswordFormInput } from "@shared/types/ChangePasswordFormInput";
import { Link as RouterLink } from "react-router-dom";

export const ChangePasswordPage = () => {
    const user = useAuthStore(s => s.user);
    const signOut = useAuthStore(s => s.signOut);

    const onSubmit = async (formInput: ChangePasswordFormInput) => {
        const res = await apiPut(`/users/${user?.id}`, formInput);
        return res; //return to show error message on form
    };

    const onCompleted = async () => {
        signOut('password_changed');
    }

    return <Box
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
    ><Paper elevation={0} sx={{ p: 6, maxWidth: 400 }}>
            <Stack sx={{ maxWidth: 400 }}>
                <Typography variant="h5" fontWeight="bold" mb={2}>Change password</Typography>
                <Alert severity="warning" icon={<WarningRoundedIcon />} sx={{ mb: 2 }}><Typography sx={{ fontSize: { xs: 'small', sm: '15px' } }}>You will be signed-out on all your devices after changing your password.</Typography></Alert>
                <ChangePasswordForm onSubmit={onSubmit} onCompleted={onCompleted} />
                <Link component={RouterLink} to="/user/account" textAlign={'center'} mt={2}>Cancel</Link>
            </Stack>
        </Paper>
    </Box>
}