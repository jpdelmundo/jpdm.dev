import { apiGet } from '@/api/apiClient.ts';
import { DateRangePicker } from '@/components/DateRangePicker.tsx';
import { WaveSkeleton } from '@/components/skeleton/WaveSkeleton.tsx';
import { type DateRangeItem, DateRangeItems } from '@/types/DateRangeItems.ts';
import { formatCounters } from '@/utils/helper.ts';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts';
import type { PostStatsDTO } from '@shared/models/dto/PostStatsDTO.ts';
import type { PostViewsDTO } from '@shared/models/dto/PostViewsDTO.ts';
import type { UserStatsDTO } from '@shared/models/dto/UserStatsDTO.ts';
import { useEffect, useState } from 'react';

const statSx = {
    width: '180px',
    //border: 'solid 1px #000000',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    padding: '20px',
    //margin: '0 auto'
    flex: { xs: '0 0 calc(50% - 10px)', sm: 'unset' },
    border: 'solid 1px #dddddd',
};

export const DashboardHome = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<PostStatsDTO | null>(null);
    const [postViews, setPostViews] = useState<PostViewsDTO[]>([]);
    const [dateRangeItem, setDateRangeItem] = useState<DateRangeItem>({ label: DateRangeItems.ThisYear.label, value: DateRangeItems.ThisYear.getValue() });

    const minDate = dateRangeItem.value[0].toDate();
    const maxDate = dateRangeItem.value[1].toDate();
    //const customTicks = [minDate, maxDate];
    const chartData = postViews;

    const getStatsData = async () => {
        setLoading(true);
        const [start_date, end_date] = dateRangeItem.value;
        const params = {
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString(),
            client_tz: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        const result = await apiGet<UserStatsDTO>('/me/stats', params);
        setLoading(false);
        if (result.ok && result.data) {
            const { stats, post_views: postViews } = result.data;
            setStats(stats);
            setPostViews(postViews);
        }
    }

    const dateRangePickerOnChange = (dateRangeItem: DateRangeItem) => {
        setDateRangeItem(dateRangeItem);
    }

    useEffect(() => {
        getStatsData();
    }, [dateRangeItem]);

    return (
        <Container sx={{ mt: 2 }}>
            <Typography variant="h5" fontWeight={'bold'}>
                Dashboard
            </Typography>
            <DateRangePicker dateRangeItem={dateRangeItem} onChange={dateRangePickerOnChange} />
            <Stack direction={'row'} gap={'10px'} my={2} flexWrap={'wrap'}>
                <Stack sx={statSx}>
                    <Typography variant="h3">{loading ? <WaveSkeleton variant="text" sx={{ width: '50%', margin: 'auto' }} /> : (stats?.post_views_count ? formatCounters(stats?.post_views_count) : 0)}</Typography>
                    <Typography>Post Views</Typography>
                </Stack>
                <Stack sx={statSx}>
                    <Typography variant="h3">{loading ? <WaveSkeleton variant="text" sx={{ width: '50%', margin: 'auto' }} /> : (stats?.post_likes_count ? formatCounters(stats?.post_likes_count) : 0)}</Typography>
                    <Typography>Post Likes</Typography>
                </Stack>
                <Stack sx={statSx}>
                    <Typography variant="h3">{loading ? <WaveSkeleton variant="text" sx={{ width: '50%', margin: 'auto' }} /> : (stats?.post_comments_count ? formatCounters(stats?.post_comments_count) : 0)}</Typography>
                    <Typography>Comments Received</Typography>
                </Stack>
            </Stack>
            <Box
                sx={{
                    backgroundColor: '#ffffff',
                    p: '10px',
                    borderRadius: '10px',
                    border: 'solid 1px #dddddd',
                }}
            >
                <Typography fontSize={'22px'} m={'0 10px'}>Post Views</Typography>
                {/* <LineChart
                    loading={loading}
                    grid={{ horizontal: true }}
                    margin={{ left: 50 }}
                    height={300}
                    xAxis={[
                        {
                            data: chartData.map(i => new Date(i.date)),
                            min: minDate,
                            max: maxDate,
                            scaleType: 'time',
                            tickInterval: customTicks,
                            disableTicks: true,
                            valueFormatter: (date: Date) =>
                                date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                }),
                        },
                    ]}
                    yAxis={[
                        {
                            disableLine: true,
                            disableTicks: true,
                            position: 'right',
                        },
                    ]}
                    series={[
                        {
                            data: chartData.map(i => i.count),
                            showMark: false
                        },
                    ]}
                ></LineChart> */}
                <BarChart
                    loading={loading}
                    grid={{ horizontal: true }}
                    margin={{ left: 50 }}
                    height={300}
                    xAxis={[
                        {
                            data: chartData.map(i => new Date(i.date)),
                            min: minDate,
                            max: maxDate,
                            disableTicks: true,
                            valueFormatter: (date: Date) =>
                                date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                }),
                        },
                    ]}
                    yAxis={[
                        {
                            disableLine: true,
                            disableTicks: true,
                            position: 'right',
                        },
                    ]}
                    series={[
                        {
                            data: chartData.map(i => i.count)
                        },
                    ]}
                />
            </Box>
        </Container>
    );
};
