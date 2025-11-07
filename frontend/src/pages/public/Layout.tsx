import { UserPanel } from '@/components/UserPanel'
import { Container, Link } from "@mui/material"
import { Outlet } from "react-router-dom"

export const Layout = () => {
    return (<Container>
        <header>
            Pic here
        </header>
        <nav>
            <Link href="/">Home</Link>
            <UserPanel />
        </nav>
        <main>
            <Outlet />
        </main>
    </Container>)
}