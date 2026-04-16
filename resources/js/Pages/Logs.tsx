import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Layout from '../Layout';

interface LogUser {
  id: number;
  name: string;
  username: string;
}

interface LogEntry {
  id: number;
  action: string;
  model: string | null;
  description: string | null;
  ip_address: string | null;
  created_at: string;
  user?: LogUser | null;
}

interface LogsResponse {
  data: LogEntry[];
  total: number;
}

interface LogsPageProps {
  isAdmin: boolean;
  users: LogUser[];
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#303030',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

const actionLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  create: 'Create',
  update: 'Edit',
  delete: 'Hapus',
  approve: 'Terima',
};

export default function Logs({ isAdmin, users }: LogsPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchLogs = async (
    pageNum: number = 1,
    perPage: number = rowsPerPage,
    dateFromValue: string = dateFrom,
    dateToValue: string = dateTo,
    userIdValue: string = selectedUserId
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: perPage.toString(),
      });

      if (dateFromValue) {
        params.append('date_from', dateFromValue);
      }

      if (dateToValue) {
        params.append('date_to', dateToValue);
      }

      if (isAdmin && userIdValue) {
        params.append('user_id', userIdValue);
      }

      const response = await fetch(`/my-logs/list?${params.toString()}`);

      if (! response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Gagal mengambil data log aktivitas');
      }

      const data: LogsResponse = await response.json();
      setLogs(data.data);
      setTotalLogs(data.total);
      setPage(pageNum - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchLogs(newPage + 1);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    fetchLogs(1, newRowsPerPage);
  };

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedUserId('');
    fetchLogs(1, rowsPerPage, '', '', '');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Log Aktivitas
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Dari Tanggal"
            type="date"
            size="small"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Sampai Tanggal"
            type="date"
            size="small"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {isAdmin && (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="log-user-filter-label">Pengguna</InputLabel>
              <Select
                labelId="log-user-filter-label"
                value={selectedUserId}
                label="Pengguna"
                onChange={(event) => setSelectedUserId(event.target.value)}
              >
                <MenuItem value="">Semua pengguna</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={String(user.id)}>
                    {user.name} (@{user.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button variant="contained" onClick={handleSearch}>
            Cari
          </Button>
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={handleReset}>
            Reset
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer sx={{ maxHeight: '600px', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Waktu</StyledTableHeadCell>
                {isAdmin && <StyledTableHeadCell>Pengguna</StyledTableHeadCell>}
                <StyledTableHeadCell>Aksi</StyledTableHeadCell>
                <StyledTableHeadCell>Modul</StyledTableHeadCell>
                <StyledTableHeadCell>Deskripsi</StyledTableHeadCell>
                <StyledTableHeadCell>IP Address</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Belum ada log aktivitas</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                    {isAdmin && <TableCell>{log.user?.name || '-'}</TableCell>}
                    <TableCell>{actionLabels[log.action] || log.action}</TableCell>
                    <TableCell>{log.model || '-'}</TableCell>
                    <TableCell>{log.description || '-'}</TableCell>
                    <TableCell>{log.ip_address || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalLogs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
        />
      </Box>
    </Layout>
  );
}
