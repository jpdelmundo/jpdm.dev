import { apiDelete, apiGet, apiPut } from '@/api/apiClient.ts';
import { Tooltip } from '@/components/Tooltip.tsx';
import { UserFormDialog } from '@/components/UserFormDialog.tsx';
import { useAuthStore } from '@/store/useAuthStore.ts';
import { useConfirmStore } from '@/store/useConfirmStore.ts';
import { theme } from '@/themes/theme.ts';
import { formatDateTime } from '@/utils/helper.ts';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataGrid, GridActionsCell, GridActionsCellItem, gridClasses, GridFooterContainer, GridPagination, gridRowSelectionStateSelector, gridRowsLookupSelector, GridSelectedRowCount, Toolbar, ToolbarButton, useGridApiContext, useGridSelector, type GridColDef, type GridRowParams, type GridSortModel } from '@mui/x-data-grid';
import { type UserDTO } from '@shared/models/dto/UserDTO.ts';
import { OrderDirection } from '@shared/types/OrderDirection.ts';
import { type Paginated } from '@shared/types/Paginated.ts';
import { getAvatarProps } from '@shared/utils/helper.ts';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Avatar } from '../../components/Avatar.tsx';

type SelectionContext = {
    selectedRows: UserDTO[];
    setSelectedRows: Dispatch<SetStateAction<UserDTO[]>>;
    getData: () => void;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const SelectionContext = createContext<SelectionContext>({
    selectedRows: [],
    setSelectedRows: () => { },
    getData: () => { },
    setLoading: () => { },
});

type PaginationModel = { page: number, pageSize: number };
type PaginationContext = {
    rowCount: number;
    paginationModel: PaginationModel;
    setPaginationModel: Dispatch<SetStateAction<PaginationModel>>;
}

const PaginationContext = createContext<PaginationContext>({
    rowCount: 0,
    paginationModel: { page: 0, pageSize: 10 },
    setPaginationModel: prev => ({ ...prev, page: 0, pageSize: 10 })
});

type SelectionProviderProps = { getData: () => void, setLoading: Dispatch<SetStateAction<boolean>>, children: ReactNode }
const SelectionProvider = ({ getData, setLoading, children }: SelectionProviderProps) => {
    const [selectedRows, setSelectedRows] = useState<UserDTO[]>([]);

    return <SelectionContext value={{ selectedRows, setSelectedRows, getData, setLoading }}>{children}</SelectionContext>
}

const CustomToolbar = () => {
    const confirm = useConfirmStore(s => s.confirm);
    const apiRef = useGridApiContext();
    const { setLoading, getData } = useContext(SelectionContext);
    const selectionModel = useGridSelector(apiRef, gridRowSelectionStateSelector);
    const rowsLookup = useGridSelector(apiRef, gridRowsLookupSelector);
    const selectedRows = Array.from(selectionModel.ids).map(id => rowsLookup[id]).filter(Boolean);

    const handleDelete = async () => {
        const selectedCount = selectionModel.ids.size;
        const confirmed = await confirm({ title: 'Delete', message: `Are you sure you want to delete ${selectedCount == 1 ? 'this user?' : `${selectedCount} selected users?`}`, confirmText: 'Delete' });
        if (confirmed) {
            setLoading(true);
            await apiDelete('/users', { ids: [...selectionModel.ids] });
            setLoading(false);
            getData();
        }
    }

    const handleRestore = async () => {
        const selectedCount = selectionModel.ids.size;
        const confirmed = await confirm({ title: 'Restore', message: `Are you sure you want to restore ${selectedCount == 1 ? 'this user?' : `${selectedCount} selected users?`}`, confirmText: 'Restore' });
        if (confirmed) {
            setLoading(true);
            await apiPut('/users', { ids: [...selectionModel.ids], deleted: false });
            setLoading(false);
            getData();
        }
    }

    return <Toolbar>
        <Tooltip title="Restore Selected">
            <ToolbarButton
                disabled={!selectedRows.some(r => r.deleted)}
                onClick={handleRestore}
            >
                <RestoreFromTrashRoundedIcon />
            </ToolbarButton>
        </Tooltip>
        <Tooltip title="Delete Selected">
            <ToolbarButton
                disabled={!selectedRows.some(r => !r.deleted)}
                onClick={handleDelete}
            >
                <DeleteForeverIcon />
            </ToolbarButton>
        </Tooltip>
    </Toolbar>
}

const CustomFooter = () => {
    const apiRef = useGridApiContext();
    const selectionModel = useGridSelector(apiRef, gridRowSelectionStateSelector);
    const selectedRows = useMemo(() => [...selectionModel.ids].map(id => apiRef.current.getRow(id)).filter(Boolean), [apiRef, selectionModel.ids]);
    const selectedCount = selectedRows.length;
    const { rowCount, paginationModel, setPaginationModel } = useContext(PaginationContext);

    return <GridFooterContainer>
        {selectedCount ? <GridSelectedRowCount selectedRowCount={selectedCount} /> : <Box />}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GridPagination />
            <Pagination
                count={Math.ceil(rowCount / paginationModel.pageSize)}
                page={paginationModel.page + 1}
                onChange={(_, value) => setPaginationModel(prev => ({ ...prev, page: value - 1 }))}
            // siblingCount={1}
            // boundaryCount={1}
            />
        </Box>
    </GridFooterContainer>

}

export function UserManagement() {
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isPortrait = useMediaQuery('(orientation: portrait)');
    const user = useAuthStore(s => s.user);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<UserDTO[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [editUser, setEditUser] = useState<UserDTO | null>(null);
    const confirm = useConfirmStore(s => s.confirm);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'created_at', sort: 'desc' }
    ]);

    const getData = useCallback(async () => {
        setLoading(true);
        const activeSort = sortModel[0];
        const result = await apiGet<Paginated<UserDTO>>('/users', {
            page_num: paginationModel.page + 1,
            page_size: paginationModel.pageSize,
            ...(activeSort.field && { order_by: activeSort.field }),
            ...(activeSort.sort && { order_dir: activeSort.sort }),
        });
        setLoading(false);
        if (result.ok && result.data) {
            const { page_items, total } = result.data;
            setRows(page_items);
            setRowCount(total);
        }
    }, [paginationModel, sortModel]);

    const handleRowDelete = useCallback(async (user: UserDTO) => {
        const confirmed = await confirm({ message: 'Are you sure you want to delete this user?', confirmText: 'Delete' });

        if (confirmed) {
            await apiDelete(`/users/${user.id}`);
            getData();
        }
    }, [confirm, getData]);

    const columns = useMemo<GridColDef<UserDTO>[]>(() => [
        {
            field: 'username',
            headerName: 'Username',
            flex: 1,
            renderCell: params => {
                const { username, profile, deleted } = params.row;
                return <Stack direction={'row'} alignItems={'center'} gap={1}>
                    <Avatar {...getAvatarProps({ username, profile })} />
                    <Typography {...(deleted && { color: 'textDisabled' })}>{params.row.username}</Typography>
                    {deleted && <Chip label="DELETED" size="small" sx={{ fontSize: '10px', height: '14px' }} />}
                </Stack>
            }
        },
        {
            field: 'first_name',
            headerName: 'First Name',
            flex: 1,
            renderCell: params => {
                return <Typography>{params.row.profile?.first_name}</Typography>
            }
        },
        {
            field: 'last_name',
            headerName: 'Last Name',
            flex: 1,
            renderCell: params => {
                return <Typography>{params.row.profile?.last_name}</Typography>
            }
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1
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
            renderCell: params => (
                <GridActionsCell {...params}>
                    <GridActionsCellItem
                        icon={<EditRoundedIcon />}
                        label="Edit"
                        onClick={() => setEditUser(params.row)}
                        showInMenu
                    />
                    <GridActionsCellItem
                        icon={<DeleteForeverRoundedIcon />}
                        label="Delete"
                        onClick={() => handleRowDelete(params.row)}
                        showInMenu
                    />
                </GridActionsCell>
            )
        }
    ], [isPortrait, isMobile, handleRowDelete]);

    const isRowSelectable = useCallback((params: GridRowParams) => params.id !== user?.id, [user?.id]);

    const pageSizeOptions = useMemo(() => [10, 20, 30], []);
    const sx = useMemo(() => ({
        border: 'var(--border)',
        [`& .${gridClasses.cell}:focus-within, & .${gridClasses.columnHeader}:focus-within`]: { outline: 'none' },
        [`& .${gridClasses.columnHeaderTitle}`]: { fontWeight: 'normal' },
        '& .MuiTablePagination-actions': { display: 'none' }
    }), []);
    const sortingOrder = useMemo(() => Object.values(OrderDirection), []);
    const slots = useMemo(() => ({
        footer: CustomFooter,
        toolbar: CustomToolbar
    }), []);

    useEffect(() => {
        getData();
    }, [getData]);

    return <Container sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={'bold'}>
            Manage Users
        </Typography>

        <SelectionProvider {...{ setLoading, getData }}>
            <PaginationContext value={{
                rowCount, paginationModel, setPaginationModel
            }}>
                <DataGrid
                    checkboxSelection
                    disableColumnMenu
                    columns={columns}
                    rows={rows}
                    rowCount={rowCount}
                    loading={loading}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    pageSizeOptions={pageSizeOptions}
                    onPaginationModelChange={setPaginationModel}
                    sortingMode="server"
                    sortingOrder={sortingOrder}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    isRowSelectable={isRowSelectable}
                    // rowSelectionModel={rowSelectionModel}
                    // onRowSelectionModelChange={setRowSelectionModel}
                    //onRowSelectionModelChange={onRowSelectionModelChange}
                    sx={sx}
                    slots={slots}
                    showToolbar
                />
            </PaginationContext>
        </SelectionProvider>

        {editUser && <UserFormDialog
            data={editUser}
            onClose={() => setEditUser(null)}
            onUpdated={(data: UserDTO) => {
                setRows(prev => prev.map(i => i.id === data.id ? data : i));
            }}
        />}

    </Container>
}