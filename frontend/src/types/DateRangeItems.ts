import { getEndOfWeek, getStartOfWeek } from '@/utils/helper.ts';
import dayjs from 'dayjs';

export const DateRangeItems = {
    Today: {
        label: 'Today',
        getValue: () => [dayjs(), dayjs()]
    },
    Yesterday: {
        label: 'Yesterday',
        getValue: () => [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')]
    },
    ThisWeek: {
        label: 'This Week',
        getValue: () => [getStartOfWeek(), getEndOfWeek()]
    },
    PreviousWeek: {
        label: 'Previous Week',
        getValue: () => [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')]
    },
    ThisMonth: {
        label: 'This Month',
        getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')]
    },
    PreviousMonth: {
        label: 'Previous Month',
        getValue: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
    },
    ThisYear: {
        label: 'This Year',
        getValue: () => [dayjs().startOf('year'), dayjs()]
    },
    PreviousYear: {
        label: 'Previous Year',
        getValue: () => [dayjs().subtract(1, 'year').startOf('year'), dayjs().subtract(1, 'year').endOf('year')]
    },
    AllTime: {
        label: 'All Time',
        getValue: () => [dayjs('2000-01-01'), dayjs()]
    }
} as const;

export type DateRangeItemLabel = typeof DateRangeItems[keyof typeof DateRangeItems]['label'] | 'Custom Range';
export type DateRangeItem = {
    label: DateRangeItemLabel;
    value: ReturnType<typeof DateRangeItems[keyof typeof DateRangeItems]['getValue']>;
}