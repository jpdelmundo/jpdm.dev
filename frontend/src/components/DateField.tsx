import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { DateFieldProps } from '@mui/x-date-pickers';
import { DateField as MuiDateField } from '@mui/x-date-pickers';
import type { Dayjs } from 'dayjs';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type Props<T extends FieldValues> = Omit<DateFieldProps, 'name'> & {
    control?: Control<T>;
    name?: Path<T>;
    labelInputGap?: string | number;
    value?: Dayjs | null;
    onChange?: (value: Dayjs | null) => void;
};

export const DateField = <T extends FieldValues>(props: Props<T>) => {
    const { label, name, control, labelInputGap, value, onChange, ...dateFieldProps } = props;

    const renderField = (value?: Dayjs | null, onChange?: (value: Dayjs | null) => void) => (
        <MuiDateField
            {...dateFieldProps}
            value={value}
            onChange={onChange}
            sx={{ width: '100%', ...dateFieldProps.sx }}
        />
    );

    return <Stack gap={labelInputGap ?? '0'} sx={{ minWidth: 0 }}>
        {label && <Typography>{label}</Typography>}
        {control && name ? (
            <Controller
                control={control}
                name={name}
                render={({ field,
                    // fieldState: { error }
                }) => renderField(field.value, newValue => field.onChange(newValue))}
            />
        ) : (
            renderField(value, onChange)
        )}
    </Stack>
}