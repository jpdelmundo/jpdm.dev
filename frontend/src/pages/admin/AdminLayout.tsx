import { Outlet } from "react-router-dom"
import Link from '@mui/material/Link';

export const AdminLayout = ()=>{
    return (<div>
        <header>
            Admin Page
        </header>
        <nav>
            <Link href="/admin">Home</Link>
        </nav>
        <main>
            <Outlet />
        </main>
    </div>)
}