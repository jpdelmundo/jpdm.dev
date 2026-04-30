import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RLink } from 'react-router-dom';

export const AboutPage = () => {
    return (
        <Container component="main" maxWidth="sm" sx={{ pt: '60px', pb: '100px' }}>
            <Paper sx={{ padding: '40px' }}>
                <Typography variant="h4" fontWeight="bold">Hi, I'm JP.</Typography>
                <Typography variant="h6" color="text.secondary">
                    Full Stack Developer & DevOps Engineer based in the Philippines.
                </Typography>
                <Typography sx={{ mt: '20px', mb: '20px' }}>
                    I've been building web applications for over 20 years - from classic PHP systems
                    to modern TypeScript monorepos. Along the way, I picked up DevOps skills running
                    my own homelab infrastructure. I design, build, and maintain full-stack solutions...
                    and the servers they run on.
                </Typography>

                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>What I Work With</Typography>
                <Stack direction="row" sx={{ mt: '10px', flexWrap: 'wrap', gap: 1 }}>
                    {['PHP', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MySQL', 'PostgreSQL', 'Docker', 'Git'].map(skill => (
                        <Chip label={skill} key={skill} />
                    ))}
                </Stack>

                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>Where I've Worked</Typography>
                <Box sx={{ mt: '10px' }}>
                    <Typography fontWeight="bold">Simpleology (2011-2025)</Typography>
                    <Typography sx={{ mb: '15px' }}>
                        14 years building and maintaining{' '}
                        <Link href="https://my.simpleology.com" target="_blank">my.simpleology.com</Link> -
                        full-stack development, server migrations, third-party integrations, and keeping things running smoothly.
                    </Typography>

                    <Typography fontWeight="bold">Earlier Roles</Typography>
                    <Typography sx={{ mb: '15px' }}>
                        Accenture, iConcerto, Mark Joyner, and others - ASP.NET, PHP, cross-platform apps,
                        payment integrations, and everything in between.
                    </Typography>
                </Box>

                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>What I'm Building Now</Typography>
                <Typography sx={{ mt: '10px', mb: '20px' }}>
                    This site, jpdm.dev, is my current playground - a social/CMS platform built with a
                    TypeScript monorepo (React + Express), OAuth authentication, PostgreSQL, and AI integrations.
                    It's running on my own infrastructure behind nginx. See the{' '}
                    <Link component={RLink} to="/projects">projects</Link> and{' '}
                    <Link component={RLink} to="/homelab">homelab</Link> pages for more.
                </Typography>

                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>Education</Typography>
                <Typography sx={{ mt: '10px', mb: '10px' }}>
                    BS Computer Science, STI-Southwoods (2001) - Best Thesis Award, Academic Excellence honors.
                </Typography>

                <Typography variant="h5" fontWeight="bold" sx={{ mt: '30px' }}>Beyond Coding</Typography>
                <Typography sx={{ mt: '10px' }}>
                    Gamer and self-hosting enthusiast. When I'm not gaming, I run my own homelab
                    with Proxmox, Docker containers, WireGuard VPNs, and various services. I also
                    do graphic design and video editing.
                </Typography>
            </Paper>
        </Container>
    );
}