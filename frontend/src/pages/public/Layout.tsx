import { UserPanel } from '@/components/UserPanel';
import { Outlet, Link as RLink } from 'react-router-dom';

import { GradientBg } from '@/components/GradientBg.tsx';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';

const linkSx: SxProps = {
    color: '#000000',
    textDecoration: 'none',
};

export const Layout = () => {
    return (
        <>
            <GradientBg />
            <Container component="header" className="header-container" sx={{ height: '60px', zIndex: 1000 }}>
                <Stack direction="row" alignItems="center" maxWidth="md" sx={{ margin: '0 auto', gap: 2 }}>
                    <Box sx={{ mr: 'auto' }}>
                        <Link
                            component={RLink}
                            to="/"
                            sx={{ fontFamily: 'Anton SC, sans-serif', fontSize: '25px', color: 'black', textDecoration: 'none' }}
                            tabIndex={-1}
                        >JPDM</Link>
                    </Box>
                    <Stack component="nav" direction={'row'} flex="1" alignContent={'center'} spacing={2} justifyContent={'center'}>
                        <Link component={RLink} to="/" sx={linkSx}>Home</Link>
                        <Divider orientation="vertical" flexItem />
                        <Link component={RLink} to="/projects" sx={linkSx}>Projects</Link>
                        <Divider orientation="vertical" flexItem />
                        <Link component={RLink} to="/homelab" sx={linkSx}>Homelab</Link>
                        <Divider orientation="vertical" flexItem />
                        <Link component={RLink} to="/services" sx={linkSx}>About</Link>
                        <Divider orientation="vertical" flexItem />
                        <Link component={RLink} to="/services" sx={linkSx}>Hire Me</Link>
                    </Stack>
                    <UserPanel sx={{ ml: 'auto', width: '55px' }} />
                </Stack>
            </Container>
            <Outlet />
        </>
    );
}