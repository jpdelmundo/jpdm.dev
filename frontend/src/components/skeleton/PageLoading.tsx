import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

//const boxProps = { padding: '10px 25px', margin: '10px 0' };

export const PageLoading = () => {
    //calc(100vh - 110px) = 100vh - (header height + html padding bottom)
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 110px)' }}>
        <CircularProgress size={'100px'} enableTrackSlot sx={{ color: '#ffffff88' }} />
    </Box>
}