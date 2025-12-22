import { UserPanel } from '@/components/UserPanel';
import { Outlet, Link as RLink } from "react-router-dom";

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

export const Layout = () => {
    return (
        <>
            <Container component="header" className="header-container scrollbar-width-aware" sx={{ height: '60px', zIndex: 1000 }}>
                <Stack direction="row" alignItems="center" maxWidth="md" sx={{ margin: '0 auto' }}>
                    <Box flex={1}>
                        <Link
                            component={RLink}
                            to="/"
                            sx={{ fontFamily: 'Anton, sans-serif', fontSize: '25px', color: 'black', textDecoration: 'none' }}
                            tabIndex={-1}
                        >JPDM</Link>
                    </Box>
                    <Box component="nav" display="flex" flex={1} justifyContent="flex-end">
                        <UserPanel />
                    </Box>
                </Stack>
            </Container>
            <Container component={'main'} maxWidth="sm" sx={{ pt: '60px' }}>
                <Outlet />
            </Container >
        </>
    );
}