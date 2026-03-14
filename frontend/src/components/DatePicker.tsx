import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DatePicker as MuiDatePicker, type DatePickerProps } from "@mui/x-date-pickers";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type Props<T extends FieldValues> = Omit<DatePickerProps, 'name'> & {
    control: Control<T>;
    name: Path<T>;
    labelInputGap?: string | number;
};

export const DatePicker = <T extends FieldValues>(props: Props<T>) => {
    const { label, name, control, labelInputGap, ...datePickerProps } = props;
    return <Stack gap={labelInputGap ?? '0'} sx={{ minWidth: 0 }}>
        {label && <Typography>{label}</Typography>}
        <Controller
            name={name}
            control={control}
            render={({ field,
                // fieldState: { error }
            }) => (
                <>
                    <MuiDatePicker
                        {...datePickerProps}
                        value={field.value ?? null}
                        onChange={newValue => field.onChange(newValue)}
                        sx={{ width: '100%', ...datePickerProps.sx }}
                        slotProps={{
                            field: {
                                clearable: true
                            }
                        }}
                    />
                </>
            )}
        />
    </Stack>
}