import { apiDelete, apiGet } from '@/api/apiClient.ts';
import { DatePicker } from '@/components/DatePicker.tsx';
import TextField from '@/components/TextField.tsx';
import { theme } from '@/themes/theme.ts';
import { formatDateTime } from '@/utils/helper.ts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataGrid, GridActionsCell, GridActionsCellItem, gridClasses, type GridColDef, type GridSortModel } from '@mui/x-data-grid';

import { PostDialog } from '@/components/PostDialog.tsx';
import { Select } from '@/components/Select.tsx';
import { Tooltip } from '@/components/Tooltip.tsx';
import { useConfirmStore } from '@/store/useConfirmStore.ts';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import MenuItem from '@mui/material/MenuItem';
import type PostDTO from '@shared/models/dto/PostDTO.ts';
import { type Paginated } from '@shared/types/Paginated.ts';
import { Visibility } from '@shared/types/Visibility.ts';
import { capitalized } from '@shared/utils/helper.ts';
import { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

type FilterFormInput = {
    post: string | null;
    dateFrom: Dayjs | null;
    dateTo: Dayjs | null;
    visibility: Visibility | 'all';
    isPublished: boolean | 'all';
}

export function Posts() {
    const [rows, setRows] = useState<PostDTO[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const processingRef = useRef(new Set());
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isPortrait = useMediaQuery('(orientation: portrait)');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'created_at', sort: 'desc' }
    ]);
    const [filters, setFilters] = useState<FilterFormInput>();
    const { register, handleSubmit, control, reset } = useForm<FilterFormInput>({
        defaultValues: {
            post: '',
            dateFrom: null,
            dateTo: null,
            visibility: 'all',
            isPublished: 'all'
        }
    });
    const [editPost, setEditPost] = useState<PostDTO | null>(null);
    const confirm = useConfirmStore(s => s.confirm);
    const getData = useCallback(async () => {
        setLoading(true);
        const activeSort = sortModel[0];
        const result = await apiGet<Paginated<PostDTO>>('/me/posts', {
            page_num: paginationModel.page + 1,
            page_size: paginationModel.pageSize,
            ...(filters?.post && { post: filters.post }),
            ...(filters?.dateFrom && { date_from: filters.dateFrom.startOf('day').toISOString() }),
            ...(filters?.dateTo && { date_to: filters.dateTo.endOf('day').toISOString() }),
            ...(filters?.visibility && filters?.visibility !== 'all' && { visibility: filters.visibility }),
            ...(filters?.isPublished && filters?.isPublished !== 'all' && { is_published: filters.isPublished }),
            ...(activeSort?.field && { order_by: activeSort.field }),
            ...(activeSort?.sort && { order_dir: activeSort.sort })
        });
        setLoading(false);
        if (result.ok && result.data) {
            const { page_items, total } = result.data;
            setRows(page_items);
            setRowCount(total);
        }
    }, [paginationModel, filters, sortModel]);

    const handleRowDelete = useCallback(async (post: PostDTO) => {
        const confirmed = await confirm({ message: 'Are you sure you want to delete this post?', confirmText: 'Delete' });

        if (confirmed) {
            processingRef.current.add(post.id);
            await apiDelete(`/posts/${post.id}`);
            processingRef.current.delete(post.id);
            getData();
        }
    }, [confirm, getData]);

    const columns = useMemo<GridColDef<PostDTO>[]>(() => [
        {
            field: 'visibility',
            align: 'center',
            headerAlign: 'center',
            width: isPortrait || isMobile ? 50 : 50,
            renderHeader: () => <VisibilityRoundedIcon sx={{ color: '#aaaaaa' }} />,
            renderCell: params => {
                return params.row.visibility == Visibility.PRIVATE ? <Tooltip title="Private"><PersonRoundedIcon /></Tooltip> : <Tooltip title="Public"><PublicOutlinedIcon /></Tooltip>
            }
        },
        {
            field: 'post',
            sortable: true,
            headerName: 'Post',
            flex: 1,
            renderCell: (params) => {
                const post = params.row;
                return <Box key={post.id} sx={{ width: '100%' }}>
                    {processingRef.current.has(params.row.id) && (
                        <CircularProgress sx={{ mr: 1 }} />
                    )}
                    <Stack sx={{ padding: '8px 0', gap: '4px' }} direction={'row'}>
                        {post.title && <Typography component="span" fontWeight={'bold'}>{post.title || ''}</Typography>}
                        <Typography component="span" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{post.title ? ` - ${post.content}` : post.content}</Typography>
                    </Stack>
                </Box>
            }
        },
        {
            field: 'is_published',
            headerName: 'Is Published?',
            headerAlign: 'center',
            align: 'center',
            width: 120,
            renderCell: params => {
                return <Typography>{params.value ? 'Published' : 'Not Published'}</Typography>
            }
        },
        {
            field: 'created_at',
            headerName: 'Created At',
            renderCell: (params) => {
                const date = formatDateTime(params.value, navigator.language, { short_month: true, date_only: true });
                const time = formatDateTime(params.value, navigator.language, { time_only: true });
                const sx = { fontSize: isMobile ? '12px' : '14px' };

                return <Box>
                    {isMobile || isPortrait
                        ? <><Typography sx={sx}>{date}</Typography><Typography sx={sx}>{time}</Typography></>
                        : <Typography sx={{ whiteSpace: 'nowrap' }}>{date} {time}</Typography>}
                </Box>
            },
            width: isMobile || isPortrait ? 100 : 200
        },
        {
            field: 'actions',
            type: 'actions',
            width: 40,
            renderCell: (params) => (
                <GridActionsCell {...params}>
                    <GridActionsCellItem
                        icon={<EditRoundedIcon />}
                        label="Edit"
                        onClick={() => setEditPost(params.row)}
                        showInMenu
                    ></GridActionsCellItem>
                    <GridActionsCellItem
                        icon={<DeleteForeverRoundedIcon />}
                        label="Delete"
                        onClick={() => handleRowDelete(params.row)}
                        showInMenu
                    ></GridActionsCellItem>
                </GridActionsCell>
            )
        }
    ], [isPortrait, isMobile, handleRowDelete, setEditPost]);

    const submitHandler: SubmitHandler<FilterFormInput> = (data) => {
        setFilters(data);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const onResetClick = () => {
        reset();
        setFilters({ post: null, dateFrom: null, dateTo: null, visibility: 'all', isPublished: 'all' });
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    }

    const onPostUpdated = useCallback((post: PostDTO) => {
        setRows(prev => prev.map(v => v.id === post.id ? post : v));
    }, []);

    const closeDialog = useCallback(() => setEditPost(null), [setEditPost]);

    useEffect(() => {
        getData();
    }, [getData]);

    return <Container sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={'bold'}>
            Manage Posts
        </Typography>

        <form onSubmit={handleSubmit(submitHandler)}>
            <Stack
                direction={{ sm: 'column', md: 'row' }}
                sx={{ my: 2, gap: 1 }}
                alignItems={{ md: 'flex-end' }}
            >
                <TextField
                    label="Search"
                    {...register('post')}
                    placeholder="Search title, content..."
                />
                <DatePicker
                    label="From"
                    name="dateFrom"
                    control={control}
                    sx={{ width: { md: '250px' } }}
                />
                <DatePicker
                    label="To"
                    name="dateTo"
                    control={control}
                    sx={{ width: { md: '250px' } }}
                />
            </Stack>
            <Stack
                direction={{ sm: 'column', md: 'row' }}
                sx={{ my: 2, gap: 1 }}
                justifyContent={'flex-start'}
                alignItems={{ md: 'flex-end' }}
            >
                <Select
                    label="Visibility"
                    control={control}
                    name="visibility"
                    sx={{ backgroundColor: 'background.paper', width: { md: '100px' } }}
                    MenuProps={{ disableScrollLock: true }}
                >
                    <MenuItem value={'all'}>All</MenuItem>
                    {Object.values(Visibility).map(item => (
                        <MenuItem key={item} value={item}>{capitalized(item)}</MenuItem>
                    ))}
                </Select>
                <Select
                    label="Is Published?"
                    control={control}
                    name="isPublished"
                    sx={{ backgroundColor: 'background.paper', width: { md: '150px' } }}
                    MenuProps={{ disableScrollLock: true }}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="true">Published</MenuItem>
                    <MenuItem value="false">Not Published</MenuItem>
                </Select>
                <Button type="submit" variant="contained" size="small" sx={{ marginLeft: { md: 'auto' } }}>
                    Search
                </Button>
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={onResetClick}
                >
                    Reset
                </Button>
            </Stack>
        </form>

        <DataGrid
            disableColumnResize
            disableColumnMenu
            // disableColumnFilter
            // disableColumnSorting
            disableColumnSelector
            paginationMode="server"
            sortingMode="server"
            sortingOrder={['asc', 'desc']}
            loading={loading}
            pageSizeOptions={[10, 20, 30]}
            columns={columns}
            rows={rows}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sx={{
                border: 'var(--border)',
                [`& .${gridClasses.cell}:focus-within, & .${gridClasses.columnHeader}:focus-within`]: { outline: 'none' },
                [`& .${gridClasses.columnHeaderTitle}`]: { fontWeight: 'normal' },
                [`& .${gridClasses.cell}[data-field="visibility"]`]: { padding: 0 }
            }}
        />

        <PostDialog
            post={editPost}
            open={Boolean(editPost)}
            closeDialog={closeDialog}
            onUpdated={onPostUpdated}
        />
    </Container>
}