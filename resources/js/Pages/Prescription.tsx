import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Stack,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  Chip,
  Paper,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id as localeId } from 'date-fns/locale';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Layout from '../Layout';
import { usePage } from '@inertiajs/react';

interface Medicine {
  id: string;
  name: string;
  price?: number;
}

interface PrescriptionItem {
  id: string;
  medicine_id: string;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  dosage: string;
  instruction: string;
  medicine: Medicine;
}

interface Prescription {
  id: string;
  examination_id: string;
  status: 'pending' | 'served';
  served_date: string | null;
  total: string | number;
  created_at: string;
  examination: {
    id: string;
    examination_date: string;
    patient: {
      id: string;
      name: string;
    };
    doctor: {
      id: number;
      name: string;
    };
  };
  items: PrescriptionItem[];
  served_by?: {
    id: number;
    name: string;
  };
}

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 500,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#303030',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

function formatRupiah(number: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(number));
}

export default function Prescription() {
  const { props } = usePage<any>();
  const user = props.auth?.user;

  const [tabValue, setTabValue] = useState(0); // 0 = pending, 1 = served
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPrescriptions = async (
    pageNumNum = page + 1,
    perPage = rowsPerPage,
    status = tabValue === 0 ? 'pending' : 'served',
    searchValue = search,
    dateFromValue = dateFrom,
    dateToValue = dateTo
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNumNum.toString(),
        per_page: perPage.toString(),
        'filters[status]': status,
      });
      if (searchValue) params.append('filters[patient_name]', searchValue);
      if (dateFromValue) params.append('filters[date_from]', dateFromValue.toISOString().slice(0, 10));
      if (dateToValue) params.append('filters[date_to]', dateToValue.toISOString().slice(0, 10));

      const response = await fetch(`/prescriptions/list?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Gagal mengambil data resep');
      }
      
      const data = await response.json();
      setPrescriptions(data.data);
      setTotal(data.total);
      setPage(pageNumNum - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchPrescriptions(1, rowsPerPage, tabValue === 0 ? 'pending' : 'served', search, dateFrom, dateTo);
    // eslint-disable-next-line
  }, [tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchPrescriptions(newPage + 1, rowsPerPage, tabValue === 0 ? 'pending' : 'served', search, dateFrom, dateTo);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    fetchPrescriptions(1, newRows, tabValue === 0 ? 'pending' : 'served', search, dateFrom, dateTo);
  };

  const handleFilterSubmit = () => {
    fetchPrescriptions(1, rowsPerPage, tabValue === 0 ? 'pending' : 'served', search, dateFrom, dateTo);
  };

  const handleOpenDialog = (prescription: Prescription) => {
    setSelected(prescription);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setOpenDialog(false);
    setSelected(null);
  };

  const handleApprove = async () => {
    if (!selected) return;
    if (!window.confirm("Apakah Anda yakin telah menyiapkan dan ingin menyelesaikan resep ini?")) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/prescriptions/${selected.id}/approve`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Gagal memproses resep');
      }
      
      handleCloseDialog();
      fetchPrescriptions(page + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses resep');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Antrean Resep
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs resep">
            <Tab label="Menunggu (Pending)" />
            <Tab label="Selesai Dilayani" />
          </Tabs>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeId}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              label="Cari nama pasien"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                      handleFilterSubmit();
                  }
              }}
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="Dari Tanggal"
              value={dateFrom}
              onChange={(v: any) => {
                const date = v instanceof Date ? v : v?.toDate?.() ?? null;
                setDateFrom(date);
              }}
              slotProps={{ 
                textField: { size: 'small', sx: { minWidth: 160 } },
                field: { clearable: true }
              }}
              format="dd/MM/yyyy"
            />
            <DatePicker
              label="Sampai Tanggal"
              value={dateTo}
              onChange={(v: any) => {
                const date = v instanceof Date ? v : v?.toDate?.() ?? null;
                setDateTo(date);
              }}
              slotProps={{ 
                textField: { size: 'small', sx: { minWidth: 160 } },
                field: { clearable: true }
              }}
              format="dd/MM/yyyy"
            />
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleFilterSubmit}
            >
              Cari
            </Button>
          </Stack>
        </LocalizationProvider>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper} sx={{ maxHeight: '600px', border: '1px solid', borderColor: 'divider', borderRadius: 1 }} elevation={0}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Tanggal Pembuatan</StyledTableHeadCell>
                <StyledTableHeadCell>Pasien</StyledTableHeadCell>
                <StyledTableHeadCell>Dokter</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Status</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Total Biaya</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Aksi</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Memuat...</TableCell>
                </TableRow>
              ) : prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Tidak ada resep ditemukan</TableCell>
                </TableRow>
              ) : (
                prescriptions.map((row) => (
                  <TableRow key={row.id}>
                    <StyledTableCell>
                      {new Date(row.created_at).toLocaleString('id-ID')}
                    </StyledTableCell>
                    <StyledTableCell>{row.examination?.patient?.name || '-'}</StyledTableCell>
                    <StyledTableCell>{row.examination?.doctor?.name || '-'}</StyledTableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status === 'pending' ? 'Pending' : 'Served'}
                        color={row.status === 'pending' ? 'warning' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatRupiah(row.total)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Button
                          size="small"
                          variant={row.status === 'pending' ? "contained" : "outlined"}
                          startIcon={row.status === 'pending' ? <CheckCircleRoundedIcon /> : <VisibilityRoundedIcon />}
                          onClick={() => handleOpenDialog(row)}
                          color={row.status === 'pending' ? "primary" : "inherit"}
                        >
                          {row.status === 'pending' ? "Proses" : "Detail"}
                        </Button>
                        {row.status === 'served' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            onClick={() => window.open(`/prescriptions/${row.id}/print`, '_blank')}
                          >
                            Cetak Resi
                          </Button>
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
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        />

        {/* Dialog Detail Resep */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth aria-labelledby="dialog-title">
          <DialogTitle id="dialog-title" sx={{ fontWeight: 'bold' }}>
            {selected?.status === 'pending' ? 'Proses Resep Pasien' : 'Detail Resep Pasien'}
          </DialogTitle>
          <DialogContent dividers>
            {selected && (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Nama Pasien</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selected.examination?.patient?.name}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Dokter Pemeriksa</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selected.examination?.doctor?.name}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Waktu Dibuat</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(selected.created_at).toLocaleString('id-ID')}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selected.status === 'pending' ? 'Menunggu' : 'Selesai'}
                    color={selected.status === 'pending' ? 'warning' : 'success'}
                    size="small"
                    sx={{ mb: 2, fontWeight: 600 }}
                  />
                  {selected.status === 'served' && selected.served_by && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Dilayani Oleh</Typography>
                      <Typography variant="body2">{selected.served_by.name}</Typography>
                    </>
                  )}
                </Box>
              </Stack>
                
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Daftar Obat</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell>Nama Obat</TableCell>
                          <TableCell align="center">Jumlah</TableCell>
                          <TableCell>Dosis</TableCell>
                          <TableCell>Instruksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selected.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.medicine?.name}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell>{item.dosage}</TableCell>
                            <TableCell>{item.instruction}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => window.open(`/prescriptions/${selected?.id}/print`, '_blank')}
              color="info"
              variant="outlined"
              sx={{ mr: 'auto' }}
              disabled={!selected}
            >
              Cetak Resi
            </Button>
            <Button onClick={handleCloseDialog} color="inherit" disabled={submitting}>Tutup</Button>
            {selected?.status === 'pending' && (user?.role === 'apoteker' || user?.role === 'admin') && (
              <Button 
                onClick={handleApprove} 
                variant="contained" 
                color="primary"
                disabled={submitting}
                startIcon={<CheckCircleRoundedIcon />}
              >
                {submitting ? 'Memproses...' : 'Tandai Selesai (Approve)'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
