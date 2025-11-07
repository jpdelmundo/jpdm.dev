import { useRoutes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Users } from './pages/admin/Users';
import { About } from './pages/public/About';
import { Home } from './pages/public/Home';
import { Layout } from './pages/public/Layout';
import { Login } from './pages/public/Login';
import { Logout } from './pages/public/Logout';
import { NotFound } from './pages/public/NotFound';
import { Register } from './pages/public/Register';
import { CreatePost } from './pages/user/CreatePost';

const routes = [
    {
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'about', element: <About /> },
            { path: 'register', element: <Register /> },
            { path: 'logout', element: <Logout /> },
            {
                path: 'user',
                children: [
                    {
                        element: <RequireAuth />,
                        children: [
                            {
                                path: 'posts',
                                children: [
                                    { path: 'create', element: <CreatePost /> }
                                ]
                            }
                        ]
                    }
                ]
            },
            { path: '*', element: <NotFound /> }
        ],
    },
    {
        path: 'admin',
        element: <RequireAuth />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminHome /> },
                    { path: 'users', element: <Users /> },
                ]
            }
        ]
    }
];

export const AppRoutes = () => {
    return useRoutes(routes);
}