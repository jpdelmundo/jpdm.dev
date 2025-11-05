import { Link } from "@mui/material"
import { Outlet } from "react-router-dom"

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