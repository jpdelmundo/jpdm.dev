import { UserPanel } from '@/components/UserPanel'
import { Container, Link } from "@mui/material"
import { Outlet, Link as RLink } from "react-router-dom"

export const Layout = () => {
    return (<Container>
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