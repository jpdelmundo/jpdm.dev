import { ImagePreviewDialog } from '@/components/ImagePreviewDialog.tsx';
import type { Project } from '@/types/Project.ts';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper, { type PaperProps } from '@mui/material/Paper';
import Slide, { type SlideProps } from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRef, useState } from 'react';
import projectData from '../../data/projects.json';

const projects = projectData as Project[];
const Item = ({ sx, ...props }: PaperProps) => {
    return <Paper sx={{
        //border: 'solid 1px var(--mui-palette-divider)',
        boxShadow: 'var(--shadow-paper)',
        ...sx
    }} {...props}></Paper>;
};

const SlideTransition = (props: SlideProps) => {
    return <Slide direction="up" {...props} />;
}

export function ProjectsPage() {
    const isWide = useMediaQuery('(min-width:420px)');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    //const [previewImage, setPreviewImage] = useState<string | null>(null);
    const previewImageSrcRef = useRef<{ open: (src: string) => void }>(null);
    const project = projects.find(project => project.id === selectedProjectId);

    const containerSx = {
        height: '270px',
        position: 'relative',
        padding: '20px',
        '&:hover': {
            '&>.MuiBox-root': {
                'marginTop': '0px',
                bgcolor: '#0f0f0fb6',
                borderRadius: '10px',
            }
        }
    };

    const ProjectOverlay = ({ project, onClick }: { project: Project; onClick: () => void }) => (
        <Box
            onClick={onClick}
            sx={{
                padding: '20px',
                bgcolor: '#ff0037',
                position: 'absolute',
                inset: 0,
                marginTop: '270px',
                borderRadius: '0px',
                cursor: 'pointer',
                transition: 'all .5s cubic-bezier(0.22, 1, 0.36, 1)' //ease-out-quint
            }}>
            <Typography color="#ffffff" fontWeight={'bold'} fontSize={'25px'} mb="10px">{project.name}</Typography>
            {project.tech?.map(tech => (
                <Chip label={tech} sx={{ color: '#ffffff', bgcolor: '#00000044', m: '3px' }} />
            ))}
        </Box>
    );

    const EmbedVideo = ({ url, title }: { url: string | undefined; title: string | undefined }) => (
        <Box sx={{ mb: '20px' }}>
            <CardMedia
                component="iframe"
                src={url}
                title={title}
                sx={{ aspectRatio: 1.86, width: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </Box>
    );

    return (
        <Container component={'main'} maxWidth={false} sx={{ pt: '60px' }}>
            <Grid
                container
                spacing={1}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: isWide ? 'repeat(auto-fit, minmax(420px, 1fr))' : '1fr'
                }}>
                {projects.map(project => {
                    const firstImage = project.media?.find(m => m.type === 'image');
                    const firstImageUrl = firstImage ? firstImage?.url.startsWith('http') ? firstImage?.url : `/images/projects/${project.id}${firstImage?.url}` : null;
                    return <Grid>

                        <Card sx={{}}>
                            {firstImageUrl ? (
                                <CardMedia
                                    image={firstImageUrl}
                                    sx={containerSx}
                                >
                                    <ProjectOverlay project={project} onClick={() => setSelectedProjectId(project.id)} />
                                </CardMedia>
                            ) : (
                                <Box sx={{ ...containerSx, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ffffff' }}>
                                    <Typography fontWeight={'bold'} fontSize={'20px'}>
                                        {project.name}
                                    </Typography>
                                    <ProjectOverlay project={project} onClick={() => setSelectedProjectId(project.id)} />
                                </Box>
                            )}
                        </Card>

                    </Grid>
                })}
            </Grid >
            <Dialog
                fullScreen
                open={Boolean(project)}
                onClose={() => setSelectedProjectId(null)}
                slots={{ transition: SlideTransition }}
                slotProps={{ paper: { sx: { margin: '0 !important' } } }}
            >
                <Stack>
                    <Stack direction={'row'} sx={{ position: 'fixed', right: '20px', top: '10px', alignItems: 'center', gap: '10px' }}>
                        <Typography color="#00000088">Esc</Typography>
                        <IconButton onClick={() => setSelectedProjectId(null)}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                    <Stack maxWidth="sm" sx={{ margin: 'auto', mt: '20px', padding: '0 10px', mb: '300px' }}>
                        <Typography color="#aaaaaa">{project?.year}</Typography>
                        <Typography variant="h4" fontWeight={'bold'}>{project?.name}</Typography>
                        <Box>
                            {/* links array below */}
                            {project?.links.map(link => (
                                <Link href={link.url} target="_blank">{link.label}</Link>
                            ))}
                        </Box>
                        <Box>
                            {/* tech stack array chips */}
                            {project?.tech.map(tech => (
                                <Chip label={tech} sx={{ m: '3px' }} />
                            ))}
                        </Box>
                        <Typography sx={{ my: '10px' }}>{project?.description}</Typography>
                        {/* media array below */}
                        {project?.media.map(media => {
                            switch (media.type) {
                                case 'image': {
                                    const src = media?.url.startsWith('http') ? media?.url : `/images/projects/${project.id}${media?.url}`;
                                    return <Box
                                        component="img"
                                        src={src}
                                        sx={{
                                            marginBottom: '20px',
                                            width: '100%',
                                            transition: 'all .3s ease',
                                            '&:hover': {
                                                filter: 'brightness(0.7)'
                                            }
                                        }}
                                        onClick={() => previewImageSrcRef.current?.open(src)}
                                    />
                                }
                                case 'youtube-embed':
                                    return <EmbedVideo title={media.title} url={media.url} />
                            }
                        })}
                    </Stack>
                </Stack>
            </Dialog>
            <ImagePreviewDialog ref={previewImageSrcRef} />
        </Container>
    );
}