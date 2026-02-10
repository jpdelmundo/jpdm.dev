import { stringToHslColor } from '@/utils/helper';
import MuiAvatar, { type AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';

type AvatarProps = MuiAvatarProps & {
    avatar_url?: string;
    display_name?: string;
}

export const Avatar = ({ avatar_url, display_name, sx, ...otherProps }: AvatarProps) => {
    //console.log({ avatar_url, display_name });
    return <MuiAvatar
        sx={{
            bgcolor: `${stringToHslColor(display_name || '')}`,
            ...sx
        }}
        {...(avatar_url && { src: avatar_url })}
        {...otherProps}
    >
        {display_name?.charAt(0).toUpperCase()}
    </MuiAvatar>;
}