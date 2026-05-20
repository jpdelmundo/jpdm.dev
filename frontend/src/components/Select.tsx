import FormControl from "@mui/material/FormControl";
import type { SelectProps } from "@mui/material/Select";
import MuiSelect from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type Props<T extends FieldValues> = Omit<SelectProps, 'name'> & {
    control: Control<T>;
    name: Path<T>;
    labelInputGap?: string | number;
};

export const Select = <T extends FieldValues>(props: Props<T>) => {
    const { label, children, name, control, labelInputGap, ...selectProps } = props;
    return <FormControl>
        <Stack gap={labelInputGap ?? '0'}>
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
        </Stack>
    </FormControl>
}