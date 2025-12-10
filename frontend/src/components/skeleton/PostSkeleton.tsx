import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { WaveSkeleton } from "./WaveSkeleton";

export function PostSkeleton() {
    return (
        <Paper className="post" elevation={0}>
            <WaveSkeleton variant="rounded" sx={{ height: { xs: '30px', sm: '40px', width: '30%', marginBottom: '10px' } }} />
            <Stack direction={'row'} className="header" alignItems="center">
                <WaveSkeleton variant="circular"><Avatar /></WaveSkeleton>
                <Box className="user-date-box" width="80%">
                    <WaveSkeleton variant="text" width="50%" sx={{ lineHeight: 1.2 }} />
                    <WaveSkeleton variant="text" width="30%" sx={{ lineHeight: 1.2 }} />
                </Box>
            </Stack>
            <Box
                borderRadius={1}
                overflow="hidden"
            >
                <WaveSkeleton variant="rounded" sx={{ height: { xs: 200, sm: 300 } }} />
            </Box>
            <WaveSkeleton variant="text" sx={{ marginTop: '25px' }} />
            <WaveSkeleton variant="text" sx={{ width: '40%' }} />
        </Paper>
    )
}