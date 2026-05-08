import { apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAvatarProps } from '@/hooks/useAvatarProps';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link as RLink } from 'react-router-dom';
import { Avatar } from './Avatar';

type Props = {
    sx?: SxProps
};

const btnSx = {
    fontWeight: 'normal',
    backgroundColor: '#f8f8f8',
    color: '#000000',
    //boxShadow: 'var(--shadow-paper)',
    gap: '5px',
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: '#e7e7e7',
        //boxShadow: 'var(--shadow-paper)'
    }
}

export const UserPanel = ({ sx }: Props) => {
    const user = useAuthStore(s => s.user);
    const avatarProps = useAvatarProps();
    const navigate = useNavigate();
    const location = useLocation();
    const clearToken = useAuthStore(s => s.clearToken);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated)
    const [loading, setLoading] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const signOut = async () => {
        userMenuOnClose();
        setLoading(true);
        await apiPost('/auth/signout', { fp: jsonBase64Encode(getFingerprint()) });
        setLoading(false);
        clearToken();
        navigate('/');
    }

    const avatarOnClick = (e: MouseEvent<HTMLElement>) => {
        if (!user) return navigate('/signin');
        setUserMenuAnchor(e.currentTarget);
        setUserMenuOpen(true);
    }

    const userMenuOnClose = () => {
        setUserMenuOpen(false);
        setUserMenuAnchor(null);
    }

    const profileOnClick = () => {
        userMenuOnClose();
        navigate('/user/profile');
    }

    const accountOnClick = () => {
        userMenuOnClose();
        navigate('/user/account');
    }

    const dashboardClick = () => {
        userMenuOnClose();
        navigate('/dashboard');
    }

    return (<Box sx={sx}>
        {
            [
                '/signin',
                '/signup',
                '/forgot-password',
                '/reset-password'
            ].every(path => !location.pathname.startsWith(path))
            && <>
                <Stack direction={'row'} justifyContent={'flex-end'}>
                    {isAuthenticated ? (
                        <IconButton onClick={avatarOnClick} sx={{ padding: 0 }}>
                            {loading
                                ? <CircularProgress />
                                : <Avatar
                                    sx={{ height: 40, width: 40 }}
                                    {...avatarProps}
                                />}
                        </IconButton>
                    ) : (
                        <Stack direction={'row'} gap={'4px'}>
                            <Button component={RLink} to="/signin" variant="outlined" size="small" sx={btnSx}>
                                <LoginRoundedIcon sx={{ fontSize: '14px' }} /> <Typography sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Sign In</Typography>
                            </Button>
                            <Button component={RLink} to="/signup" variant="outlined" size="small" sx={btnSx}>
                                <PersonAddRoundedIcon sx={{ fontSize: '14px' }} /> <Typography sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Sign Up</Typography>
                            </Button>
                        </Stack>
                    )}
                </Stack>
                {/* <Grid><Link component={RouterLink} to="/signin"></Link> {user?.username}</Grid> */}
                {/* <Grid><Link component={RouterLink} to="/signin"></Link> {user?.username}</Grid> */}
                {/* <Grid>{loading ? <CircularProgress /> : (isAuthenticated && <Link onClick={signOut} sx={{ cursor: 'pointer' }}>Logout</Link>)}</Grid> */}
                <Menu
                    className="context-menu"
                    anchorEl={userMenuAnchor}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={userMenuOpen}
                    onClose={userMenuOnClose}
                    transitionDuration={0}
                    disableScrollLock={true}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                overflow: 'unset',
                                mt: '15px',
                                // '&::before': {
                                //     content: '""',
                                //     display: 'block',
                                //     position: 'absolute',
                                //     top: 0,
                                //     right: '15px',
                                //     width: 10,
                                //     height: 10,
                                //     bgcolor: 'background.paper',
                                //     transform: 'translateY(-50%) rotate(45deg)',
                                //     zIndex: 1,
                                // },
                            }
                        }
                    }}
                >
                    <MenuItem onClick={profileOnClick}>
                        <AccountCircleRoundedIcon sx={{ mr: '10px' }} /> <Typography>Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={accountOnClick}>
                        <AdminPanelSettingsRoundedIcon sx={{ mr: '10px' }} /> <Typography>Account & Security</Typography>
                    </MenuItem>
                    <MenuItem onClick={dashboardClick}>
                        <SpaceDashboardOutlinedIcon sx={{ mr: '10px' }} /> <Typography>Dashboard</Typography>
                    </MenuItem>
                    <MenuItem onClick={signOut}>
                        <LogoutRoundedIcon sx={{ mr: '10px' }} /> <Typography>Sign Out</Typography>
                    </MenuItem>
                </Menu>
            </>
        }
    </Box>);
}