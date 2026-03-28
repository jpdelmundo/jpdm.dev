import Box, { type BoxProps } from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { WaveSkeleton } from "./WaveSkeleton";

export function PostCommentSkeleton(props: BoxProps) {
    return <Box className="comment" {...props}>
        <Stack direction={'row'} gap={1}>
            <WaveSkeleton variant="circular" sx={{ width: '32px', height: '32px' }} />
            <Box flex={1}>
                <Stack className="detail" minWidth={'50%'}>
                    <WaveSkeleton variant="text" width="50%" sx={{ lineHeight: 1.2 }} />
                    <WaveSkeleton variant="text" width="70%" sx={{ lineHeight: 1.2 }} />
                    <WaveSkeleton variant="text" width="30%" sx={{ lineHeight: 1.2 }} />
                </Stack>
            </Box>
        </Stack>
    </Box>
}