import server from '@/assets/images/server2.jpg';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ApiErrorDetail } from '@shared/types/ApiResult';
import { ErrorCode } from '@shared/types/ErrorCode';

type ErrorProps = {
    error: ApiErrorDetail;
}

export function Error({ error }: ErrorProps) {
    let message = 'Unknown error';
    let subMessage = null;
    let code: string | undefined;
    //let name: string | undefined;

    if ('code' in error) {
        code = error.code;
        message = error.message;
        if (code == ErrorCode.INVALID_ID
            || code == ErrorCode.NOT_FOUND) {
            message = '"Hmm...di ko nakita"';
            subMessage = '(not found, 404)';
        }
    } else {
        const e = (error as Error);
        message = e.message;
        //name = e.name;
    }

    return (<Stack justifyContent={'center'} sx={{ height: 'calc(90vh - 60px)' }}>
        <img src={server} style={{ margin: '0 auto', display: 'block', borderRadius: '16px', maxWidth: '100%', width: '300px' }} />
        <Stack direction="row" justifyContent={'center'} gap={1} marginTop={'10px'}>
            <Stack>
                <Typography variant="h4" textAlign="center" sx={{ fontWeight: 'bold', maxWidth: '100%', fontSize: 'clamp(1rem, 9vw, 30px)', whiteSpace: 'nowrap' }}>{message}</Typography>
                {subMessage && <Typography variant="h6" textAlign="right" sx={{ marginTop: '-10px', marginRight: '10px', fontSize: 'clamp(1rem, 9vw, 1.25rem)' }}>{subMessage}</Typography>}
                <Typography variant="h4" textAlign="right" sx={{ fontSize: 'clamp(1rem, 9vw, 25px)' }}> - server</Typography>
            </Stack>
            {/* {code && <Typography textAlign="center">Code: {code}</Typography>}
            {name && <Typography textAlign="center">Type: {name}</Typography>} */}
        </Stack >
    </Stack>);
}