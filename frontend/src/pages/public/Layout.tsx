import { UserPanel } from '@/components/UserPanel';
import { Outlet, Link as RLink } from 'react-router-dom';

import { GradientBg } from '@/components/GradientBg.tsx';
import { theme } from '@/themes/theme.ts';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';

type MenuItem = { label: string; to: string; visible: boolean };

const linkSx: SxProps = {
    color: '#000000',
    textDecoration: 'none',
};

const menuItems: MenuItem[] = [
    { label: 'Home', to: '/', visible: true },
    { label: 'Projects', to: '/projects', visible: true },
    { label: 'Homelab', to: '/homelab', visible: true },
    { label: 'About', to: '/about', visible: true },
    { label: 'Hire Me', to: '/services', visible: false },
];

export const Layout = () => {
    const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const onMenuClick = () => setDrawerOpen(prev => !prev);

    return (
        <>
            <GradientBg />
            <Drawer
                open={drawerOpen && isSmDown}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '240px'
                    }
                }}
            >
                <List>
                    <Typography
                        sx={{
                            fontFamily: 'Anton SC, sans-serif',
                            fontSize: '25px',
                            color: 'black',
                            textDecoration: 'none',
                            padding: '8px 16px',
                        }}
                        tabIndex={-1}
                    >JPDM</Typography>
                    {menuItems.filter((item) => item.visible).map((item) => (
                        <ListItem disablePadding>
                            <ListItemButton component={RLink} to={item.to} sx={{ ...linkSx, px: 4 }} onClick={() => setDrawerOpen(false)}>
                                <ListItemText>{item.label}</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Container component="header" className="header-container" sx={{ height: '60px', zIndex: 1000 }}>
                <Stack direction="row" alignItems="center" maxWidth="md" sx={{ margin: '0 auto', gap: 2 }}>
                    <Stack direction="row" gap={2} alignItems={'center'} sx={{ mr: 'auto' }}>
                        <IconButton
                            onClick={onMenuClick}
                            sx={{ display: isSmDown ? '' : 'none' }}
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                        <Link
                            component={RLink}
                            to="/"
                            sx={{ fontFamily: 'Anton SC, sans-serif', fontSize: '25px', color: 'black', textDecoration: 'none' }}
                            tabIndex={-1}
                        >JPDM</Link>
                    </Stack>
                    <Stack
                        component="nav"
                        direction={'row'}
                        flex="1"
                        spacing={2}
                        justifyContent={'center'}
                        sx={{ display: isSmDown ? 'none' : '' }}
                    >
                        {menuItems.filter((item) => item.visible).map((item, index, arr) => (
                            <>
                                <Link component={RLink} to={item.to} sx={linkSx}>{item.label}</Link>
                                {index < arr.length - 1 && <Divider orientation="vertical" flexItem />}
                            </>
                        ))}
                    </Stack>
                    <UserPanel sx={{ ml: 'auto', width: '55px' }} />
                </Stack>
            </Container>
            <Outlet />
        </>
    );
}