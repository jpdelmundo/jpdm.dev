import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import type { SelectProps } from "@mui/material/Select";
import MuiSelect from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type Props<T extends FieldValues> = Omit<SelectProps, 'name'> & { control: Control<T>, name: Path<T> };

export const Select = <T extends FieldValues>(props: Props<T>) => {
    const { label, children, name, control, ...selectProps } = props;
    return <Box>
        <FormControl fullWidth sx={{ gap: '4px' }}>
            {label && <Typography fontWeight="500">{label}</Typography>}
            <Controller
                name={name}
                control={control}
                render={({ field,
                    // fieldState: { error }
                }) => (
                    <>
                        <MuiSelect
                            {...field}
                            {...selectProps}
                        >
                            {children}
                        </MuiSelect>
                    </>
                )}
            >
            </Controller>
        </FormControl>
    </Box>
}