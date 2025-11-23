import { useRoutes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Users } from './pages/admin/Users';
import { About } from './pages/public/About';
import { Home } from './pages/public/Home';
import { Layout } from './pages/public/Layout';
import { NotFound } from './pages/public/NotFound';
import { SignIn } from './pages/public/SignIn';
import { SignUp } from './pages/public/SignUp';
import { CreatePost } from './pages/user/CreatePost';

const routes = [
    {
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'signin', element: <SignIn /> },
            { path: 'about', element: <About /> },
            { path: 'signup', element: <SignUp /> },
            //{ path: 'signout', element: <SignOut /> },
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