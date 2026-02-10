import Dialog from '@mui/material/Dialog';

interface Props {
    open: boolean;
}

export const LoginDialog = (props: Props) => {
    const { open } = props;

    return (
        <Dialog open={open}>
            {/* <LoginForm /> */}
        </Dialog>
    );
}