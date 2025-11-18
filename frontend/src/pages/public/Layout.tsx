import { UserPanel } from '@/components/UserPanel';
import { Outlet, Link as RLink } from "react-router-dom";

import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

export const Layout = () => {
    return (<Container maxWidth="sm">
        <header>
            Pic here
        </header>
        <nav>
            <Link component={RLink} to="/">Home</Link>
            <UserPanel />
        </nav>
        <main>
            <Outlet />
        </main>
    </Container>)
}