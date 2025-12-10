import { ClientApiError } from "@/api/apiClient";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type ErrorProps = {
    error: unknown;
}

export function Error({ error }: ErrorProps) {
    let message = 'Unknow error';
    let code: string | undefined;
    let name: string | undefined;

    if (error instanceof ClientApiError) {
        message = error.message;
        code = error.code;
    } else {
        const e = (error as Error);
        message = e.message;
        name = e.name;
    }

    return (
        <Stack>
            <Typography>{message}</Typography>
            {code && <Typography>{code}</Typography>}
            {name && <Typography>Type: {name}</Typography>}
        </Stack>
    );
}