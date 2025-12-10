import { useRoutes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Users } from './pages/admin/Users';
import { About } from './pages/public/About';
import { Home } from './pages/public/Home';
import { ImagePage } from './pages/public/ImagePage';
import { Layout } from './pages/public/Layout';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { PostPage } from './pages/public/PostPage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { CreatePost } from './pages/user/CreatePost';

const routes = [
    {
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'signin', element: <SignInPage /> },
            { path: 'about', element: <About /> },
            { path: 'signup', element: <SignUpPage /> },
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
            { path: 'posts/:id', element: <PostPage /> },
            { path: 'images/:id', element: <ImagePage /> },
            { path: '*', element: <NotFoundPage /> }
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