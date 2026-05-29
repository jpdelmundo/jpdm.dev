import { UserPanel } from '@/components/UserPanel';
import { useAuthStore } from '@/store/useAuthStore.ts';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { Outlet, Link as RLink, useNavigate } from 'react-router-dom';

export const DashboardLayout = () => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const user = useAuthStore(s => s.user);

    const menuItemClick = (index: number) => {
        if (menuItems[index]) {
            setSelectedIndex(index);
            navigate(menuItems[index].path);
            setDrawerOpen(false);
        }
    };

    const onDrawerClose = () => {
        setDrawerOpen(false);
    }

    const onMenuClick = () => {
        setDrawerOpen(!drawerOpen);
    }

    const menuItems = [
        { text: 'Stats', path: '/dashboard', icon: InsertChartOutlinedRoundedIcon },
        { text: 'Posts', path: '/dashboard/posts', icon: ArticleOutlinedIcon },
        { text: 'Comments', path: '/dashboard/comments', icon: ForumRoundedIcon },
        { admin: true, text: 'Posts', path: '/dashboard/admin/posts', icon: ArticleOutlinedIcon },
        { admin: true, text: 'Comments', path: '/dashboard/admin/comments', icon: ForumRoundedIcon },
        { admin: true, text: 'Users', path: '/dashboard/admin/users', icon: GroupRoundedIcon },
        { admin: true, text: 'Tokens', path: '/dashboard/admin/tokens', icon: KeyRoundedIcon },
        { admin: true, text: 'Logs', path: '/dashboard/admin/logs', icon: DescriptionRoundedIcon }
    ];

    // useEffect(() => {
    //     const origHtmlOverflow = document.documentElement.style.overflow;
    //     const origBodyOverflow = document.body.style.overflow;

    //     document.documentElement.style.overflow = 'hidden';
    //     document.body.style.overflow = 'hidden';

    //     return () => {
    //         document.documentElement.style.overflow = origHtmlOverflow;
    //         document.body.style.overflow = origBodyOverflow;
    //     };
    // }, []);

    return (
        <>
            <Stack>
                <Container component="header" className="header-container" sx={{ height: '60px', zIndex: 1, borderBottom: 'solid 1px #eeeeee', backgroundColor: '#ffffff !important' }}>
                    <Stack direction="row" alignItems="center" sx={{ margin: '0 auto' }}>
                        <Stack direction="row" gap={2}>
                            <IconButton
                                sx={{ display: isSmUp ? 'none' : '' }}
                                onClick={onMenuClick}
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
                        <Box component="nav" display="flex" flex={1} justifyContent="flex-end">
                            <UserPanel />
                        </Box>
                    </Stack>
                </Container>
                <Stack direction={'row'} flex={1} sx={{ minHeight: 0, mt: '60px' }}>
                    <Drawer
                        variant={isSmUp ? 'persistent' : 'temporary'}
                        anchor="left"
                        open={isSmUp ? true : drawerOpen}
                        onClose={onDrawerClose}
                        sx={{
                            width: '240px',
                            '& .MuiDrawer-paper': {
                                top: 60,
                                width: '240px'
                            }
                        }}
                    >
                        <List>
                            <ListItem sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Dashboard</ListItem>
                            {menuItems.map((item, index) => {
                                if (item.admin) return;
                                const Icon = item.icon;
                                const { text } = item;
                                return (
                                    <ListItem key={text} disablePadding>
                                        <ListItemButton
                                            sx={{ gap: '15px' }}
                                            onClick={() => menuItemClick(index)}
                                            selected={selectedIndex === index}
                                        >
                                            <ListItemIcon sx={{ minWidth: 0 }}><Icon /></ListItemIcon>
                                            <ListItemText primary={text} />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                            {user?.roles.includes('admin') && <>
                                <ListItem sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Admin</ListItem>
                                {menuItems.map((item, index) => {
                                    if (!item.admin) return;
                                    const Icon = item.icon;
                                    const { text } = item;
                                    return (
                                        <ListItem key={`admin-${text}`} disablePadding>
                                            <ListItemButton
                                                sx={{ gap: '15px' }}
                                                onClick={() => menuItemClick(index)}
                                                selected={selectedIndex === index}
                                            >
                                                <ListItemIcon sx={{ minWidth: 0 }}><Icon /></ListItemIcon>
                                                <ListItemText primary={text} />
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                })}

                            </>}
                        </List>
                    </Drawer>
                    <Stack
                        flex={1}
                        sx={{ width: 'calc(100vw - 240px)' }}>
                        <Container
                            component={'main'}
                            sx={{
                                maxWidth: 'unset !important',
                                padding: '0px !important'
                            }}
                        >
                            <Outlet />
                        </Container >
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}