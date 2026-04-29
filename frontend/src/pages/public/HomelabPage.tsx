import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import diagramSvg from '../../assets/homelab.svg?raw';

const nodeTableSx = {
    '--mui-palette-TableCell-border': '#e0e0e0',
    '& .MuiTableBody-root': {
        borderTop: 'solid 3px var(--mui-palette-TableCell-border)'
    },
    mb: '20px'
};

function DiagramViewer() {
    const isPortraitMode = useMediaQuery('(orientation: portrait)');
    const [rerender, setRerender] = useState<number>(0);

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            setRerender(prev => prev + 1);
        });
        ro.observe(document.documentElement);
        return () => ro.disconnect();
    }, []);

    return (
        <Box sx={{
            width: isPortraitMode ? '100vw' : '80vw',
            height: isPortraitMode ? '60vh' : '100vh',
            position: 'fixed',
            top: 0
        }}>
            <TransformWrapper
                key={rerender}
                initialScale={isPortraitMode ? 1 : 1.2}
                minScale={0.5}
                maxScale={5}
                limitToBounds={false}
                wheel={{ step: 0.0015 }}
                velocityAnimation={{
                    inertia: 0.01,
                    maxStrengthMouse: 1,
                    maxStrengthTouch: 1,
                    maxAnimationTime: 100
                }}
                centerOnInit={true}
                onInit={(instance) => {
                    //adjust offset after centering
                    const offsetX = isPortraitMode ? 0 : -100;
                    const offsetY = isPortraitMode ? 50 : 50;
                    instance.setTransform(instance.state.positionX + offsetX, instance.state.positionY + offsetY, instance.state.scale);
                }}
            >
                <TransformComponent
                    wrapperStyle={{ width: '100%', height: '100%' }}
                    contentStyle={{ width: '100%', height: '100%' }}
                >
                    <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: diagramSvg }} />
                </TransformComponent>
            </TransformWrapper >
        </Box>
    );
}

export function HomelabPage() {
    const isPortraitMode = useMediaQuery('(orientation: portrait)');

    return <Container component={'main'} maxWidth={false} sx={{ p: '0 !important' }}>
        <DiagramViewer />
        <Box sx={isPortraitMode ? {
            position: 'relative',
            mt: '50vh',
            mx: '10px',
            pb: '70px',
            zIndex: 1
        } : {
            position: 'absolute',
            right: '20px',
            my: '70px',
            width: '30%',
            pb: '70px'
        }}>
            <Box sx={{
                p: '40px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-paper)'
            }}>
                <Typography variant="h5" fontWeight={'bold'}>The Goal</Typography>
                <Typography sx={{ margin: '10px 0 20px 0' }}>Securely access my home network from anywhere in the world and reliably host websites and services directly from my own local infrastructure.</Typography>
                <Typography variant="h5" fontWeight={'bold'}>The Problem</Typography>
                <Typography sx={{ margin: '10px 0 20px 0' }}>In the early 2010s, living in the province, the only internet available in our area was through a canopy antenna that provided around 2Mbps. It was serviceable but painfully limited. On top of that, ISPs reserved static IP addresses for business plans, which were far too costly for personal use.</Typography>
                <Typography variant="h5" fontWeight={'bold'}>The Solution</Typography>
                <Typography sx={{ margin: '10px 0 20px 0' }}>Around 2011, I first learned about OpenVPN, but limited hardware and a slow connection made it impractical at the time. By 2017, I discovered WireGuard and began experimenting with it seriously. When we relocated in 2020, I finally had the right conditions to put it to real use. I configured WireGuard to connect three separate locations: my parents' house, my grandparents' house, and our home.</Typography>
                <Typography variant="h5" fontWeight={'bold'}>The Setup</Typography>
                <Typography sx={{ margin: '10px 0' }}>The goal was to have all three locations see each other over the internet, while also making my self-hosted apps and services accessible from outside the local network. The architecture uses a site-to-site VPN configuration with a central public endpoint acting as the WireGuard server.</Typography>
                <Typography sx={{ margin: '10px 0 20px 0' }}>A dedicated public IP from my ISP was not an option since residential plans do not offer it, and the business plans that do were not worth the cost for a personal hobby project. The practical alternative was renting a VPS that comes with a public IP, installing Linux on it, and using it as the WireGuard server. With a stable public endpoint in place, each location connects to it as a peer, forming a unified private network across three physical sites. Each location also has its own WireGuard client that acts as the tunnel router for its local subnet.</Typography>
                <Typography variant="h5" fontWeight={'bold'}>The Peers</Typography>
                <Typography sx={{ margin: '10px 0' }}>At home, WireGuard runs inside a Debian LXC container. Its AllowedIPs is scoped to the WireGuard network range and the subnets of all connected locations. Static routes are configured on my ASUS RT-AX3000 so it knows where to forward VPN-bound traffic. This container serves as the WireGuard gateway for the home network.</Typography>
                <Typography sx={{ margin: '10px 0' }}>At my parents' house, an ASUS RT-AX53U running OpenWRT handles the same role. WireGuard was installed directly through OpenWRT's package manager. The configuration mirrors the home setup, with scoped AllowedIPs and static routing to keep everything clean and intentional.</Typography>
                <Typography sx={{ margin: '10px 0' }}>At my grandparents' house, a TUF-AX3000 router and a Raspberry Pi Zero 2W are currently being set up. VNC is being used in the meantime while the WireGuard configuration is finalized.</Typography>
                <Typography sx={{ margin: '10px 0 20px 0' }}>All three locations operate on separate, non-overlapping subnets to avoid routing conflicts.</Typography>
                <Typography variant="h5" fontWeight={'bold'}>The Nodes</Typography>
                <Typography variant="h6" fontWeight={'bold'} fontStyle={'italic'} color="#999999" sx={{ mt: '10px' }}>Cloud</Typography>
                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>VPS (WireGuard Server)</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>4 vCPU (Intel Haswell @ 2.0GHz, virtualized)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>8GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>80GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Ubuntu</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography variant="h6" fontWeight={'bold'} fontStyle={'italic'} color="#999999" sx={{ mt: '10px' }}>Home</Typography>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>ASUS RT-AX3000 Router</Typography>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Dell OptiPlex 3080 Micro (Home Server)</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>Intel Core i5-10500T</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>32GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>512GB + 1TB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Proxmox (Debian)</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Morefine M9 N100 Mini PC</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>Intel N100</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>16GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>512GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>HDD</TableCell>
                            <TableCell>4TB RAID 1</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Ubuntu</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Trigkey N100 Mini PC</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>Intel N100</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>16GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>512GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Debian</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>AI Agent PC</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>Allwinner H618 (Quad-core, LPDDR4)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>4GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Micro SD</TableCell>
                            <TableCell>64GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Armbian</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Gaming / Local LLM PC</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>AMD Ryzen 5 5600</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>GPU</TableCell>
                            <TableCell>NVIDIA RTX 3070</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>16GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>512GBx2</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>1TB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Windows 11</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Dev PC</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>AMD Ryzen 5 5700X3D</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>GPU</TableCell>
                            <TableCell>NVIDIA RTX 4060</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>16GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>512GBx2</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>SSD</TableCell>
                            <TableCell>1TB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>HDD</TableCell>
                            <TableCell>2TB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Windows 11</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography variant="h6" fontWeight={'bold'} fontStyle={'italic'} color="#999999" sx={{ mt: '10px' }}>Parents' House</Typography>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>ASUS RT-AX53U Router</Typography>
                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>ASUS RT-AC88U Router</Typography>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Orange Pi Zero 3</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>Allwinner H618 (Quad-core, LPDDR4)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>4GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Micro SD</TableCell>
                            <TableCell>64GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Armbian</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Western Digital EX2 NAS</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>HDD</TableCell>
                            <TableCell>2TB RAID 1</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography variant="h6" fontWeight={'bold'} fontStyle={'italic'} color="#999999" sx={{ mt: '10px' }}>Grandparents' House</Typography>
                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>ASUS RT-AC88U Router</Typography>
                <Typography fontWeight={'bold'} sx={{ m: '10px 0' }}>Raspberry Pi Zero 2 W</Typography>
                <Table sx={nodeTableSx}>
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU</TableCell>
                            <TableCell>RP3A0 4x1GHz 64-bit ARM Cortex-A53</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>RAM</TableCell>
                            <TableCell>512MB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Micro SD</TableCell>
                            <TableCell>32GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OS</TableCell>
                            <TableCell>Raspberry Pi OS</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </Box>
    </Container>
}