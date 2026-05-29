import { useRoutes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { UserManagement } from './pages/admin/UserManagement.tsx';
import { DashboardLayout } from './pages/dashboard/DashboardLayout.tsx';
import { PostComments } from './pages/dashboard/PostComments.tsx';
import { Posts } from './pages/dashboard/Posts.tsx';
import { Stats } from './pages/dashboard/Stats.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { AuthCallbackPage } from './pages/public/AuthCallback';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { Home } from './pages/public/Home';
import { HomelabPage } from './pages/public/HomelabPage.tsx';
import { ImagePage } from './pages/public/ImagePage';
import { Layout } from './pages/public/Layout';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { PostPage } from './pages/public/PostPage';
import { ProjectsPage } from './pages/public/ProjectsPage.tsx';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { AccountPage } from './pages/user/AccountPage';
import { ChangePasswordPage } from './pages/user/ChangePasswordPage';
import { CreatePost } from './pages/user/CreatePost';
import { ProfilePage } from './pages/user/ProfilePage';
import { UpdateEmailAccountPage } from './pages/user/UpdateEmailAccountPage';

const routes = [
    {
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'auth/callback', element: <AuthCallbackPage /> },
            { path: 'signin', element: <SignInPage /> },
            { path: 'about', element: <AboutPage /> },
            { path: 'projects', element: <ProjectsPage /> },
            { path: 'homelab', element: <HomelabPage /> },
            { path: 'signup', element: <SignUpPage /> },
            //{ path: 'signout', element: <SignOut /> },
            {
                path: 'user',
                element: <RequireAuth />,
                children: [
                    { path: 'profile', element: <ProfilePage /> },
                    { path: 'account', element: <AccountPage /> },
                    { path: 'update-email', element: <UpdateEmailAccountPage /> },
                    { path: 'change-password', element: <ChangePasswordPage /> },
                    {
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
            { path: 'posts/:id/*', element: <PostPage /> },
            { path: 'images/:id', element: <ImagePage /> },
            { path: 'forgot-password', element: <ForgotPasswordPage /> },
            { path: 'reset-password/:token_hash', element: <ResetPasswordPage /> },
            { path: '*', element: <NotFoundPage /> }
        ],
    },
    {
        path: 'dashboard',
        element: <RequireAuth />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { index: true, element: <Stats /> },
                    { path: 'posts', element: <Posts /> },
                    { path: 'comments', element: <PostComments /> },
                ]
            }
        ]
    },
    {
        path: 'dashboard/admin',
        element: <RequireAuth />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    // { path: 'posts', element: <Posts /> },
                    // { path: 'comments', element: <PostComments /> },
                    { path: 'users', element: <UserManagement /> },
                ]
            }
        ]
    },
];

export const AppRoutes = () => {
    return useRoutes(routes);
}