import { apiPost } from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getFingerprint } from '@/utils/device';
import { jsonBase64Encode } from '@shared/utils/encoding';
import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { stringToHslColor } from '@/utils/helper';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export const UserPanel = () => {
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();
    const location = useLocation();
    const clearToken = useAuthStore(s => s.clearToken);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated)
    const [loading, setLoading] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const signOut = async () => {
        setLoading(true);
        await apiPost('/auth/signout', { fp: jsonBase64Encode(getFingerprint()) });
        setLoading(false);
        userMenuOnClose();
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

    return (<>
        {
            !location.pathname.startsWith('/signin')
            && !location.pathname.startsWith('/signup')
            &&
            <Grid container gap={1}>
                <Grid>
                    <IconButton onClick={avatarOnClick} sx={{ padding: 0 }}>
                        {loading
                            ? <CircularProgress />
                            : isAuthenticated
                                ? <Avatar sx={{ bgcolor: `${stringToHslColor(user?.username || '')}`, height: 40, width: 40 }}>{user?.username.charAt(0).toUpperCase()}</Avatar>
                                : <AccountCircle fontSize={'large'} color={isAuthenticated ? 'disabled' : 'disabled'} />}
                    </IconButton>
                </Grid>
                {/* <Grid><Link component={RouterLink} to="/signin"></Link> {user?.username}</Grid> */}
                {/* <Grid><Link component={RouterLink} to="/signin"></Link> {user?.username}</Grid> */}
                {/* <Grid>{loading ? <CircularProgress /> : (isAuthenticated && <Link onClick={signOut} sx={{ cursor: 'pointer' }}>Logout</Link>)}</Grid> */}
                <Menu
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
                                boxShadow: '0 1px 2px #cccccc',
                                overflow: 'unset',
                                mt: '15px',
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: '14px',
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 1,
                                },
                            }
                        }
                    }}
                >
                    <MenuItem>Settings</MenuItem>
                    <MenuItem>Profile</MenuItem>
                    <MenuItem onClick={signOut}>Sign Out</MenuItem>
                </Menu>
            </Grid>
        }
    </>);
}