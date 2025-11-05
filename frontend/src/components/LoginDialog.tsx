import { Dialog } from '@mui/material';
import { LoginForm } from './LoginForm';

interface Props {
    open: boolean;
}

export const LoginDialog = (props: Props)=>{
    const {open} = props;

    return (
        <Dialog open={open}>
            <LoginForm />
        </Dialog>
    );
}