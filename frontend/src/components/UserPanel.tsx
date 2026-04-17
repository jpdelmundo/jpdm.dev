import { apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAvatarProps } from '@/hooks/useAvatarProps';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps } from '@mui/material/styles';
import { Avatar } from './Avatar';

type Props = {
    sx: SxProps
};

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
            && <Grid container gap={1}>
                <Grid>
                    <IconButton onClick={avatarOnClick} sx={{ padding: 0 }}>
                        {loading
                            ? <CircularProgress />
                            : isAuthenticated
                                ? <Avatar
                                    sx={{ height: 40, width: 40 }}
                                    {...avatarProps}
                                />
                                : <AccountCircle fontSize={'large'} color={isAuthenticated ? 'disabled' : 'disabled'} />}
                    </IconButton>
                </Grid>
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
                    <MenuItem onClick={profileOnClick}>Profile</MenuItem>
                    <MenuItem onClick={accountOnClick}>Account & Security</MenuItem>
                    <MenuItem onClick={dashboardClick}>Dashboard</MenuItem>
                    <MenuItem onClick={signOut}>Sign Out</MenuItem>
                </Menu>
            </Grid>
        }
    </Box>);
}