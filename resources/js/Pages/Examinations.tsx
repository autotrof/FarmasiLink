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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  Chip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id as localeId } from 'date-fns/locale';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Layout from '../Layout';

interface Examination {
  id: string;
  patient_id: string;
  doctor_id: number;
  examination_date: string;
  findings: string;
  height: number;
  weight: number;
  systole: number;
  diastole: number;
  heart_rate: number;
  respiration_rate: number;
  temperature: number;
  document_path: string | null;
  patient?: {
    id: string;
    name: string;
  };
  doctor?: {
    id: number;
    name: string;
  };
}

interface ExaminationsResponse {
  data: Examination[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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

function getTemperatureColor(temp: number) {
  if (temp < 36) return 'info';
  if (temp <= 37.5) return 'success';
  if (temp <= 38.5) return 'warning';
  return 'error';
}

export default function Examinations() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalExaminations, setTotalExaminations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    examination_date: '',
    findings: '',
    height: '',
    weight: '',
    systole: '',
    diastole: '',
    heart_rate: '',
    respiration_rate: '',
    temperature: '',
  });

  const fetchExaminations = async (
    pageNum: number = 1,
    searchValue: string = search,
    dateFromValue: Date | null = dateFrom,
    dateToValue: Date | null = dateTo
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: rowsPerPage.toString(),
      });
      if (searchValue) params.append('filters[search]', searchValue);
      if (dateFromValue) params.append('filters[date_from]', dateFromValue.toISOString().slice(0, 10));
      if (dateToValue) params.append('filters[date_to]', dateToValue.toISOString().slice(0, 10));

      const response = await fetch(`/examinations/list?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data pemeriksaan');

      const data: ExaminationsResponse = await response.json();
      setExaminations(data.data);
      setTotalExaminations(data.total);
      setPage(pageNum - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations(1, search, dateFrom, dateTo);
    // eslint-disable-next-line
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchExaminations(newPage + 1, search, dateFrom, dateTo);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchExaminations(1, search, dateFrom, dateTo);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    fetchExaminations(1, value, dateFrom, dateTo);
  };

  const handleDateFromChange = (value: any) => {
    const date = value instanceof Date ? value : value?.toDate?.() ?? null;
    setDateFrom(date);
    setPage(0);
    fetchExaminations(1, search, date, dateTo);
  };

  const handleDateToChange = (value: any) => {
    const date = value instanceof Date ? value : value?.toDate?.() ?? null;
    setDateTo(date);
    setPage(0);
    fetchExaminations(1, search, dateFrom, date);
  };

  const handleOpenDialog = (examination?: Examination) => {
    if (examination) {
      setDialogMode('edit');
      setSelectedExamination(examination);
      setFormData({
        patient_id: examination.patient_id,
        examination_date: examination.examination_date.split('T')[0],
        findings: examination.findings,
        height: examination.height.toString(),
        weight: examination.weight.toString(),
        systole: examination.systole.toString(),
        diastole: examination.diastole.toString(),
        heart_rate: examination.heart_rate.toString(),
        respiration_rate: examination.respiration_rate.toString(),
        temperature: examination.temperature.toString(),
      });
    } else {
      setDialogMode('create');
      setSelectedExamination(null);
      setFormData({
        patient_id: '',
        examination_date: '',
        findings: '',
        height: '',
        weight: '',
        systole: '',
        diastole: '',
        heart_rate: '',
        respiration_rate: '',
        temperature: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      patient_id: '',
      examination_date: '',
      findings: '',
      height: '',
      weight: '',
      systole: '',
      diastole: '',
      heart_rate: '',
      respiration_rate: '',
      temperature: '',
    });
  };

  const handleSaveExamination = async () => {
    try {
      const method = dialogMode === 'create' ? 'POST' : 'PUT';
      const url = dialogMode === 'create' ? '/examinations' : `/examinations/${selectedExamination?.id}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan pemeriksaan');

      handleCloseDialog();
      fetchExaminations(page + 1, search);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleDeleteExamination = async (examinationId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pemeriksaan ini?')) return;

    try {
      const response = await fetch(`/examinations/${examinationId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus pemeriksaan');
      fetchExaminations(page + 1, search);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Manajemen Pemeriksaan
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => handleOpenDialog()}
          >
            Tambah Pemeriksaan
          </Button>
        </Box>

        {/* Filters */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeId}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Cari temuan/pasien/dokter"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="Dari Tanggal"
              value={dateFrom}
              onChange={handleDateFromChange}
              slotProps={{ 
                textField: { size: 'small', sx: { minWidth: 160 } },
                field: { clearable: true }
              }}
              format="dd/MM/yyyy"
            />
            <DatePicker
              label="Sampai Tanggal"
              value={dateTo}
              onChange={handleDateToChange}
              slotProps={{ 
                textField: { size: 'small', sx: { minWidth: 160 } },
                field: { clearable: true }
              }}
              format="dd/MM/yyyy"
            />
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => fetchExaminations(1, search, dateFrom, dateTo)}
            >
              Segarkan
            </Button>
          </Stack>
        </LocalizationProvider>

        {/* Error Alert */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Table */}
        <TableContainer sx={{ maxHeight: '600px', mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Tanggal Pemeriksaan</StyledTableHeadCell>
                <StyledTableHeadCell>Pasien</StyledTableHeadCell>
                <StyledTableHeadCell>Dokter</StyledTableHeadCell>
                <StyledTableHeadCell>Temuan</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Suhu</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Nadi</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Tekanan Darah</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Aksi</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : examinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Tidak ada data pemeriksaan
                  </TableCell>
                </TableRow>
              ) : (
                examinations.map((examination) => (
                  <TableRow key={examination.id}>
                    <StyledTableCell>
                      {new Date(examination.examination_date).toLocaleDateString('id-ID')}
                    </StyledTableCell>
                    <StyledTableCell>{examination.patient?.name || '-'}</StyledTableCell>
                    <StyledTableCell>{examination.doctor?.name || '-'}</StyledTableCell>
                    <StyledTableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {examination.findings}
                    </StyledTableCell>
                    <TableCell align="center">
                      <Chip
                        label={examination.temperature + '°C'}
                        color={getTemperatureColor(Number(examination.temperature)) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">{examination.heart_rate} bpm</TableCell>
                    <TableCell align="center">
                      {examination.systole}/{examination.diastole} mmHg
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => handleOpenDialog(examination)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        startIcon={<DeleteRoundedIcon />}
                        onClick={() => handleDeleteExamination(examination.id)}
                      >
                        Hapus
                      </Button>
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
          count={totalExaminations}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        />

        {/* Examination Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Tambah Pemeriksaan' : 'Edit Pemeriksaan'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Tanggal Pemeriksaan"
              type="date"
              value={formData.examination_date}
              onChange={(e) => setFormData({ ...formData, examination_date: e.target.value })}
              fullWidth
            />
            <TextField
              label="ID Pasien"
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Temuan"
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Tinggi (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                fullWidth
              />
              <TextField
                label="Berat (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Sistole (mmHg)"
                type="number"
                value={formData.systole}
                onChange={(e) => setFormData({ ...formData, systole: e.target.value })}
                fullWidth
              />
              <TextField
                label="Diastole (mmHg)"
                type="number"
                value={formData.diastole}
                onChange={(e) => setFormData({ ...formData, diastole: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Nadi (bpm)"
                type="number"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                fullWidth
              />
              <TextField
                label="Pernapasan (bpm)"
                type="number"
                value={formData.respiration_rate}
                onChange={(e) => setFormData({ ...formData, respiration_rate: e.target.value })}
                fullWidth
              />
            </Stack>
            <TextField
              label="Suhu (°C)"
              type="number"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Batal</Button>
            <Button variant="contained" onClick={handleSaveExamination}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
