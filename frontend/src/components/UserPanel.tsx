import { useAuthStore } from '@/store/useAuthStore';
import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export const UserPanel = () => {
    const user = useAuthStore(s => s.user);
    return (
        <Grid container>
            <Grid><Link to="/login">Login</Link> {user?.username}</Grid>
        </Grid>
    );
}