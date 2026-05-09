import { apiDelete, apiGet, apiPut } from '@/api/apiClient.ts';
import { DatePicker } from '@/components/DatePicker.tsx';
import TextField from '@/components/TextField.tsx';
import { useConfirmStore } from '@/store/useConfirmStore.ts';
import { formatDateTime } from '@/utils/helper.ts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
    DataGrid,
    GridActionsCell,
    GridActionsCellItem,
    gridClasses,
    useGridApiContext,
    useGridApiRef,
    type GridColDef,
    type GridRenderEditCellParams,
} from '@mui/x-data-grid';
import type { PostCommentDTO } from '@shared/models/dto/PostCommentDTO.ts';
import type { Paginated } from '@shared/types/Paginated.ts';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
// import EditRoundedIcon from '@mui/icons-material/EditRounded';
// import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { theme } from '@/themes/theme.ts';
import useMediaQuery from '@mui/material/useMediaQuery';
import { slugFormat } from '@shared/utils/helper.ts';

type FilterFormInput = {
    comment: string;
    dateFrom: Dayjs | null;
    dateTo: Dayjs | null;
};

const LongTextEditCell = (params: GridRenderEditCellParams) => {
    const { id, field, value } = params;
    const apiRef = useGridApiContext();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.focus();
            // put cursor at end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(ref.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            if (!e.shiftKey) {
                e.preventDefault();
                apiRef.current.setEditCellValue({
                    id,
                    field,
                    value: String(ref.current?.innerText ?? '')
                        .trim()
                        .replace(/\n{3,}/g, '\n\n'),
                });
                apiRef.current.stopCellEditMode({ id, field });
            }
        }
    };

    return (
        <div
            className="content"
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={handleKeyDown}
            style={{
                width: '100%',
                // minHeight: '40px',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '15px',
                lineHeight: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                cursor: 'text',
            }}
        >
            {value}
        </div>
    );
};

export const PostComments = () => {
    const [rows, setRows] = useState<PostCommentDTO[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(new Set());
    const apiRef = useGridApiRef();
    const confirm = useConfirmStore((s) => s.confirm);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isPortrait = useMediaQuery('(orientation: portrait)');

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [filters, setFilters] = useState<FilterFormInput>({
        comment: '',
        dateFrom: null,
        dateTo: null,
    });

    const { register, control, handleSubmit, reset } = useForm<FilterFormInput>(
        {
            defaultValues: {
                comment: '',
                dateFrom: null,
                dateTo: null,
            },
        },
    );

    const submitHandler: SubmitHandler<FilterFormInput> = (data) => {
        setFilters(data);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const onResetClick = () => {
        reset();
        setFilters({ comment: '', dateFrom: null, dateTo: null });
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const handleEdit = (row: PostCommentDTO) => {
        apiRef.current?.startCellEditMode({ id: row.id, field: 'comment' });
    };

    const handleDelete = async (row: PostCommentDTO) => {
        const confirmed = await confirm('Are you sure?');
        if (confirmed) {
            await apiDelete(`/me/comments/${row.id}`);
            getData();
        }
    };

    const columns: GridColDef<PostCommentDTO>[] = [
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 1,
            renderCell: (params) => {
                const { post } = params.row;
                return (
                    <React.Fragment key={params.row.id}>
                        {processing.has(params.row.id) && (
                            <CircularProgress sx={{ mr: 1 }} />
                        )}
                        <Stack sx={{ padding: '8px 0', alignItems: 'flex-start' }}>
                            {!post ? '[Post deleted]' : (
                                <Link href={`/posts/${post.id}/${slugFormat((post.title || post.content))}`} target="_blank"
                                    sx={{ padding: '5px', borderRadius: '10px', textDecoration: 'none', color: 'var(--mui-palette-text-disabled)', '&:hover': { textDecoration: 'underline' } }}>
                                    <Typography
                                        sx={{ fontWeight: 'bold', fontSize: '12px' }}
                                        color="textDisabled"
                                    >
                                        {post.title}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold', fontSize: '12px' }}
                                        color="textDisabled"
                                    >
                                        {post.display_name}
                                    </Typography>
                                    <Box sx={{ lineHeight: '14px' }}>
                                        <Typography component="span" sx={{ color: '#777777', fontSize: '12px' }}>
                                            {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                        </Typography>
                                    </Box>
                                </Link>
                            )}
                            <Box sx={{ padding: '6px 12px', borderRadius: '20px', border: 'solid 1px #dddddd', backgroundColor: '#ffffff' }}>
                                <Typography className="content">
                                    {params.value}
                                </Typography>
                            </Box>
                        </Stack>
                    </React.Fragment >
                );
            },
            renderEditCell: (params) => <LongTextEditCell {...params} />,
            editable: true,
        },
        {
            field: 'created_at',
            headerName: 'Date',
            renderCell: (params) => {
                const date = formatDateTime(params.value, navigator.language, { short_month: true, date_only: true });
                const time = formatDateTime(params.value, navigator.language, { time_only: true });
                const sx = {
                    fontSize: isMobile ? '12px' : '14px'
                };

                return <Box>
                    {isMobile || isPortrait
                        ? <><Typography sx={sx}>{date}</Typography><Typography sx={sx}>{time}</Typography></>
                        : <Typography sx={{ ...sx, whiteSpace: 'nowrap' }}>{date} {time}</Typography>}
                </Box>
            },
            width: isMobile || isPortrait ? 100 : 200
        },
        {
            field: 'actions',
            type: 'actions',
            renderCell: (params) => (
                <GridActionsCell {...params}>
                    <GridActionsCellItem
                        label="Edit"
                        onClick={() => handleEdit(params.row)}
                        showInMenu
                    />
                    <GridActionsCellItem
                        label="Delete"
                        onClick={() => handleDelete(params.row)}
                        showInMenu
                    />
                </GridActionsCell>
            ),
            width: 40,
        },
    ];

    const processRowUpdate = async (
        newRow: PostCommentDTO,
        oldRow: PostCommentDTO,
    ) => {
        if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
        const { comment } = newRow;

        (async () => {
            try {
                setProcessing((prev) => new Set(prev).add(newRow.id));
                const result = await apiPut<PostCommentDTO>(`/me/comments/${newRow.id}`, { comment },);
                //console.log({ result });

                return result.data ?? oldRow;
            } catch (error) {
                console.error({ error });
                //TODO snackbar here
                return oldRow;
            } finally {
                setProcessing((prev) => {
                    const next = new Set(prev);
                    next.delete(newRow.id);
                    return next;
                });
            }
        })();

        return newRow;
    };

    const getData = async () => {
        setLoading(true);
        console.debug({
            from: filters.dateFrom?.toISOString(),
            to: filters.dateTo?.endOf('day').toISOString(),
        });
        const result = await apiGet<Paginated<PostCommentDTO>>('/me/comments', {
            page_num: paginationModel.page + 1,
            page_size: paginationModel.pageSize,
            ...(filters.comment && { comment: filters.comment }),
            ...(filters.dateFrom && { date_from: filters.dateFrom.startOf('day').toISOString(), }),
            ...(filters.dateTo && { date_to: filters.dateTo.endOf('day').toISOString(), }),
        });
        setLoading(false);
        if (result.ok && result.data) {
            const { page_items, total } = result.data;
            setRows(page_items);
            setRowCount(total);
        }
    };

    useEffect(() => {
        getData();
    }, [paginationModel, filters]);

    return (
        <Container sx={{ mt: 2 }}>
            <Typography variant="h5" fontWeight={'bold'}>
                Manage Comments
            </Typography>
            <form onSubmit={handleSubmit(submitHandler)}>
                <Stack
                    direction={{ sm: 'column', md: 'row' }}
                    sx={{ mb: 2, mt: 2, gap: 1 }}
                    alignItems={{ md: 'flex-end' }}
                >
                    <TextField
                        label="Search"
                        {...register('comment')}
                        placeholder="Search comments..."
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
                    <Button type="submit" variant="contained" size="small">
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
                apiRef={apiRef}
                getRowHeight={() => 'auto'}
                disableColumnResize
                disableColumnMenu
                disableColumnFilter
                disableColumnSorting
                disableColumnSelector
                rows={rows}
                columns={columns}
                rowCount={rowCount}
                loading={loading}
                paginationMode="server"
                pageSizeOptions={[10, 20, 30]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                processRowUpdate={processRowUpdate}
                sx={{
                    [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
                    {
                        outline: 'none',
                    },
                    [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                    {
                        outline: 'none',
                    },
                    [`& .${gridClasses.columnHeaderTitle}`]: {
                        color: '#aaaaaa',
                        fontWeight: 'normal'
                    },
                    '& .MuiDataGrid-editLongTextCellTextarea': {
                        //lineHeight: 1.5,
                        fontSize: 15,
                    },
                    '& .MuiDataGrid-row:hover': { '.post-url': { display: 'inline' } }
                }}
            />
        </Container>
    );
};