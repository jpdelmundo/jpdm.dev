import { DateRangeItems, type DateRangeItem, type DateRangeItemLabel } from '@/types/DateRangeItems.ts';
import { formatDateTime, getEndOfWeek, getStartOfWeek } from '@/utils/helper.ts';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DateCalendar } from '@mui/x-date-pickers';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useState, type MouseEvent } from 'react';
import { DateField } from './DateField.tsx';

type Props = {
    dateRangeItem: DateRangeItem;
    onChange: (dateRangeItem: DateRangeItem) => void;
}

export const DateRangePicker = ({ dateRangeItem, onChange }: Props) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [startDate, setStartDate] = useState<Dayjs | null>(dateRangeItem.value[0]);
    const [endDate, setEndDate] = useState<Dayjs | null>(dateRangeItem.value[1]);
    const [leftMonth, setLeftMonth] = useState(dayjs().subtract(1, 'month'));
    const [rightMonth, setRightMonth] = useState(dayjs());
    const [activeCalendar, setActiveCalendar] = useState<'start' | 'end'>('start');
    const [label, setLabel] = useState<DateRangeItemLabel>(dateRangeItem.label);
    const [calOpen, setCalOpen] = useState(dateRangeItem.label == 'Custom Range');
    const [highlightField, setHighlightField] = useState<string | null>(null);
    const isSmall = useMediaQuery('(max-width:500px)');
    const [rangeListOpen, setRangeListOpen] = useState(true);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const customRangeMenuItemOnClick = () => {
        const [start, end] = DateRangeItems.ThisWeek.getValue();
        setCalOpen(true);
        setStartDate(start);
        setEndDate(end);
        isSmall && setRangeListOpen(false);
    }

    const getCustomRangeLabel = () => {
        const start = startDate ?? getStartOfWeek();
        const end = endDate ?? getEndOfWeek();
        return `${formatDateTime(start.toDate(), navigator.language, { date_only: true, short_month: true })} - ${formatDateTime(end.toDate(), navigator.language, { date_only: true, short_month: true })}`;
    }

    const customRangeOKOnClick = () => {
        const start = startDate ?? getStartOfWeek();
        const end = endDate ?? getEndOfWeek();
        setLabel('Custom Range');
        handleClose();
        onChange({ label: 'Custom Range', value: [start, end] });
    }

    const showListOnClick = () => {
        setRangeListOpen(!rangeListOpen);
    }

    const open = Boolean(anchorEl);
    const id = open ? 'date-range-picker-popover' : undefined;

    useEffect(() => {
        setCalOpen(label == 'Custom Range');

    }, [anchorEl]);

    return (
        <>
            <Button
                variant="outlined"
                onClick={handleClick}
                size="small"
                sx={{
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    borderColor: '#dddddd',
                    transition: 'border-color 1.s ease',
                    '&:hover': {
                        borderColor: '#aaaaaa',
                        backgroundColor: '#eeeeee'
                    },
                    display: 'flex',
                    gap: '5px'
                }}
            >
                <DateRangeRoundedIcon sx={{ fontSize: '20px', color: '#555555' }} />
                <Typography>{label == 'Custom Range' ? getCustomRangeLabel() : label}</Typography>
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                onClose={handleClose}
                transitionDuration={0}
                disableScrollLock
                disableRestoreFocus
                slotProps={{
                    paper: {
                        sx: {
                            border: 'solid 1px #dddddd',
                            boxShadow: '0 3px 6px #00000022 !important'
                        }
                    },
                    transition: {
                        timeout: 0
                    }
                }}
                sx={{ zIndex: 2001 }}
                keepMounted
            >
                <Stack direction={'row'}>
                    <MenuList sx={{ display: rangeListOpen ? 'block' : 'none' }}>
                        {Object.entries(DateRangeItems).map(([, i]) => (
                            <MenuItem
                                key={i.label}
                                onClick={() => {
                                    const { label, getValue } = i;
                                    const [start, end] = getValue();
                                    setLabel(label);
                                    handleClose();
                                    onChange({ label, value: [start, end] });
                                    requestAnimationFrame(() => {
                                        setStartDate(start);
                                        setEndDate(end);
                                    });
                                }}
                            >
                                {i.label}
                            </MenuItem>
                        ))}
                        <MenuItem onClick={customRangeMenuItemOnClick}>Custom Range</MenuItem>
                    </MenuList>
                    <Stack sx={{ borderLeft: 'solid 1px #dddddd', display: calOpen ? 'flex' : 'none' }}>
                        <Stack
                            direction={'row'}
                            gap={'10px'}
                            sx={{ m: '15px' }}>
                            <DateField
                                label="From"
                                value={startDate}
                                onChange={newValue => setStartDate(newValue)}
                                onFocus={() => setActiveCalendar('start')}
                                sx={{
                                    width: '140px',
                                    '& .MuiPickersInputBase-root': {
                                        transition: 'background-color .3s ease',
                                        backgroundColor: highlightField == 'start' ? '#ffeea2' : 'inherit',
                                        padding: '0 10px'
                                    },
                                }}
                                clearable
                            />
                            <DateField
                                label="To"
                                value={endDate}
                                onChange={newValue => setEndDate(newValue)}
                                onFocus={() => setActiveCalendar('end')}
                                sx={{
                                    width: '140px',
                                    '& .MuiPickersInputBase-root': {
                                        transition: 'background-color .3s ease',
                                        backgroundColor: highlightField == 'end' ? '#ffeea2' : 'inherit',
                                        padding: '0 10px'
                                    }
                                }}
                                clearable
                            />
                        </Stack>
                        <DateCalendar
                            value={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                if (date && endDate && date.isAfter(endDate, 'day')) {
                                    setEndDate(date);
                                }
                                setHighlightField('start');
                                setTimeout(() => setHighlightField(null), 300);
                            }}
                            onMonthChange={(month) => {
                                setLeftMonth(month);
                                if (month.isAfter(rightMonth)) setRightMonth(month.add(1, 'month'));
                            }}
                            slotProps={{
                                nextIconButton: { disabled: leftMonth.isSame(rightMonth, 'month') || leftMonth.isAfter(rightMonth, 'month') }
                            }}
                            sx={{
                                display: activeCalendar == 'start' ? 'flex' : 'none'
                            }}
                        />
                        <DateCalendar
                            value={endDate}
                            onChange={(date) => {
                                setEndDate(date);
                                if (date && startDate && date.isBefore(startDate, 'day')) {
                                    setStartDate(date);
                                }
                                setHighlightField('end');
                                setTimeout(() => setHighlightField(null), 300);
                            }}
                            onMonthChange={(month) => {
                                setRightMonth(month);
                                if (month.isBefore(leftMonth)) setLeftMonth(month.subtract(1, 'month'));
                            }}
                            slotProps={{
                                previousIconButton: { disabled: rightMonth.isSame(leftMonth, 'month') || rightMonth.isAfter(leftMonth, 'month') }
                            }}
                            sx={{
                                display: activeCalendar == 'end' ? 'flex' : 'none'
                            }}
                        />
                        <Stack
                            direction={'row'}
                            justifyContent={'flex-end'}
                            sx={{ m: '0 10px 10px 10px', gap: '10px' }}
                        >
                            <Button
                                sx={{ marginRight: 'auto', display: isSmall ? 'flex' : 'none' }}
                                onClick={showListOnClick}
                            >&lt; {rangeListOpen ? 'Hide' : 'Show'} List</Button>
                            <Button onClick={handleClose} size="small">Cancel</Button>
                            <Button variant="contained" onClick={customRangeOKOnClick} size="small">OK</Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Popover>
        </>
    );
}