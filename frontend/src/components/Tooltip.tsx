import type { TooltipProps } from "@mui/material/Tooltip";
import MuiTooltip from "@mui/material/Tooltip";


export function Tooltip({ children, ...props }: TooltipProps) {
    return <MuiTooltip
        arrow
        placement="top"
        slotProps={{
            transition: { timeout: 0 }
        }}
        {...props}>{children}</MuiTooltip>
}