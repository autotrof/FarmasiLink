import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Typography,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Layout from '../Layout';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { usePage } from '@inertiajs/react';

interface Medicine {
  id: string;
  name: string;
  unit_price: number | null;
}

interface MedicinesResponse {
  data: Medicine[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PriceHistory {
  id: string;
  unit_price: number;
  start_date: string;
  end_date: string | null;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#303030',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

export default function Medicines() {
  const { props } = usePage();
  const user = (props.auth as any)?.user;
  const isAdmin = user?.role === 'admin';

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const [openPriceHistoryDialog, setOpenPriceHistoryDialog] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);

  const fetchMedicines = async (pageNum: number = 1, searchValue: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: rowsPerPage.toString(),
      });

      if (searchValue) params.append('filters[search]', searchValue);

      const response = await fetch(`/medicines/list?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data obat');

      const data: MedicinesResponse = await response.json();
      setMedicines(data.data);
      setTotalMedicines(data.total);
      setPage(pageNum - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(1, search);
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchMedicines(newPage + 1, search);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchMedicines(1, search);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    fetchMedicines(1, value);
  };

  const handleRefreshMedicines = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch('/medicines/refresh', { method: 'POST' });
      if (!response.ok) throw new Error('Gagal melakukan refresh data obat');

      alert('Data obat sedang diperbarui. Silahkan tunggu beberapa saat...');
      fetchMedicines(page + 1, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setOpenDetailDialog(true);
  };

  const handleViewPriceHistory = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setPriceHistoryLoading(true);
    try {
      const response = await fetch(`/medicines/${medicine.id}/price-history`);
      if (!response.ok) throw new Error('Gagal mengambil history harga');

      const data = await response.json();
      setPriceHistory(data.data || []);
      setOpenPriceHistoryDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setPriceHistoryLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Manajemen Data Obat
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleRefreshMedicines}
              disabled={refreshing}
            >
              {refreshing ? 'Memperbarui...' : 'Refresh Data'}
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Cari nama obat"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => fetchMedicines(1, search)}
          >
            Segarkan
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Table */}
        <TableContainer sx={{ maxHeight: '600px', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Nama Obat</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Harga Satuan</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Aksi</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">Tidak ada data obat</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id} sx={{ backgroundColor: 'white' }}>
                    <StyledTableCell>{medicine.name}</StyledTableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(medicine.unit_price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(medicine)}
                          title="Lihat Detail"
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => handleViewPriceHistory(medicine)}
                            title="Lihat History Harga"
                          >
                            <HistoryRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalMedicines}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        />

        {/* Detail Dialog */}
        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Detail Obat</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Nama Obat
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedMedicine?.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ID Obat
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {selectedMedicine?.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Harga Satuan Saat Ini
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatCurrency(selectedMedicine?.unit_price)}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
          </DialogActions>
        </Dialog>

        {/* Price History Dialog */}
        <Dialog
          open={openPriceHistoryDialog}
          onClose={() => setOpenPriceHistoryDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>History Harga - {selectedMedicine?.name}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {priceHistoryLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : priceHistory.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                Tidak ada data history harga
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Harga</TableCell>
                      <TableCell>Tanggal Mulai</TableCell>
                      <TableCell>Tanggal Berakhir</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceHistory.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(history.unit_price)}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(history.start_date)}</TableCell>
                        <TableCell>
                          {history.end_date ? formatDate(history.end_date) : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={!history.end_date ? 'Aktif' : 'Berakhir'}
                            color={!history.end_date ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPriceHistoryDialog(false)}>Tutup</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
