import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export const ContactPage = () => {
    return (
        <Container component="main" maxWidth="sm" sx={{ pt: '60px', pb: '100px' }}>
            <Paper sx={{ padding: '40px' }}>
                <Typography variant="h4" fontWeight="bold">Contact</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>Email</Typography>
                <Typography sx={{ mt: '10px' }}><a href="mailto:jpdelmundo@gmail.com" style={{ color: '#333333' }}>jpdelmundo@gmail.com</a></Typography>
                <Typography><a href="mailto:jp@jpdm.com" style={{ color: '#333333' }}>jp@jpdm.dev</a></Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>Phone</Typography>
                <Typography><a href="tel:+63-998-551-1373" style={{ color: '#333333' }}>+63-998-551-1373</a></Typography>
            </Paper>
        </Container>
    );
}