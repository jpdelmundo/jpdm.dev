import { useRoutes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { About } from './pages/About';
import { Home } from './pages/Home';
import { Layout } from './pages/Layout';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Register } from './pages/Register';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Users } from './pages/admin/Users';

const routes = [
    {
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'about', element: <About /> },
            { path: 'register', element: <Register /> },
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