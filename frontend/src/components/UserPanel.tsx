import { useAuthStore } from '@/store/useAuthStore';
import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export const UserPanel = () => {
    const user = useAuthStore(s => s.user);
    // const navigate = useNavigate();
    // const clearToken = useAuthStore(s => s.clearToken);
    // const [loading, setLoading] = useState(false);

    // const logout = async () => {
    //     setLoading(true);
    //     await apiPost('/auth/logout', { fingerprint: jsonBase64Encode(getFingerprint()) });
    //     setLoading(false);
    //     clearToken();
    //     navigate('/login');
    // }

    return (
        <Grid container gap={1}>
            <Grid><Link to="/login">Login</Link> {user?.username}</Grid>
            <Grid><Link to="/logout">Logout</Link></Grid>
        </Grid>
    );
}