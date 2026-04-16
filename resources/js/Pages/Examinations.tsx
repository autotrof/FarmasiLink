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
  Autocomplete,
  IconButton,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id as localeId } from 'date-fns/locale';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
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
  prescription?: {
    id: string;
    status: string;
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

  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [patientInputValue, setPatientInputValue] = useState('');

  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [selectedExaminationForPrescription, setSelectedExaminationForPrescription] = useState<Examination | null>(null);
  const [prescriptionItems, setPrescriptionItems] = useState<{ medicine_id: string; quantity: string; dosage: string; instruction: string }[]>([]);
  const [medicines, setMedicines] = useState<{ id: string; name: string }[]>([]);
  const [medicineInputValue, setMedicineInputValue] = useState('');
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  const [formData, setFormData] = useState<{
    patient_id: string;
    examination_date: string;
    findings: string;
    height: string;
    weight: string;
    systole: string;
    diastole: string;
    heart_rate: string;
    respiration_rate: string;
    temperature: string;
    document: File | null;
  }>({
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
    document: null,
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`/patients/list?filters[search]=${encodeURIComponent(patientInputValue)}&per_page=50`);
        if (response.ok) {
          const data = await response.json();
          setPatients(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [patientInputValue]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch(`/medicines/list?filters[search]=${encodeURIComponent(medicineInputValue)}&per_page=50`);
        if (response.ok) {
          const data = await response.json();
          setMedicines((prev) => {
            const newMeds = [...prev];
            data.data.forEach((m: any) => {
              if (!newMeds.find(x => x.id === m.id)) newMeds.push({ id: m.id, name: m.name });
            });
            return newMeds;
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchMedicines();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [medicineInputValue]);

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
      // Try to load initial patient info to Autocomplete options if possible
      if (examination.patient && !patients.find((p) => p.id === examination.patient_id)) {
          setPatients((prev) => [...prev, { id: examination.patient_id, name: examination.patient!.name }]);
      }
      setFormData({
        patient_id: examination.patient_id,
        examination_date: examination.examination_date.split('T')[0],
        findings: examination.findings,
        height: examination.height?.toString() || '',
        weight: examination.weight?.toString() || '',
        systole: examination.systole?.toString() || '',
        diastole: examination.diastole?.toString() || '',
        heart_rate: examination.heart_rate?.toString() || '',
        respiration_rate: examination.respiration_rate?.toString() || '',
        temperature: examination.temperature?.toString() || '',
        document: null,
      });
    } else {
      setDialogMode('create');
      setSelectedExamination(null);
      // Get today's date in YYYY-MM-DD format based on local timezone
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;
      
      setFormData({
        patient_id: '',
        examination_date: localDateString,
        findings: '',
        height: '',
        weight: '',
        systole: '',
        diastole: '',
        heart_rate: '',
        respiration_rate: '',
        temperature: '',
        document: null,
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
      document: null,
    });
  };

  const handleSaveExamination = async () => {
    try {
      const url = dialogMode === 'create' ? '/examinations' : `/examinations/${selectedExamination?.id}`;

      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          payload.append(key, value as string | Blob);
        }
      });

      if (dialogMode === 'edit') {
        payload.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: 'POST',
        body: payload,
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

  const handleOpenPrescription = async (examination: Examination) => {
    setSelectedExaminationForPrescription(examination);
    if (examination.prescription) {
      setLoadingPrescription(true);
      try {
        const response = await fetch(`/prescriptions/${examination.prescription.id}`);
        const data = await response.json();
        const mappedItems = data.items.map((item: any) => {
          if (item.medicine) {
            setMedicines(prev => {
              if (!prev.find(m => m.id === item.medicine.id)) {
                return [...prev, { id: item.medicine.id, name: item.medicine.name }];
              }
              return prev;
            });
          }
          return {
            medicine_id: item.medicine_id,
            quantity: item.quantity?.toString() || '',
            dosage: item.dosage,
            instruction: item.instruction || '',
          };
        });
        setPrescriptionItems(mappedItems);
      } catch (err) {
        console.error(err);
        alert('Gagal memuat detail resep');
      } finally {
        setLoadingPrescription(false);
      }
    } else {
      setPrescriptionItems([{ medicine_id: '', quantity: '', dosage: '', instruction: '' }]);
    }
    setOpenPrescriptionDialog(true);
  };

  const handleClosePrescriptionDialog = () => {
    setOpenPrescriptionDialog(false);
    setSelectedExaminationForPrescription(null);
    setPrescriptionItems([]);
  };

  const handleSavePrescription = async () => {
    if (!selectedExaminationForPrescription) return;
    try {
      const isCreate = !selectedExaminationForPrescription.prescription;
      const url = isCreate 
        ? '/prescriptions' 
        : `/prescriptions/${selectedExaminationForPrescription.prescription!.id}`;
      
      const payload = {
        examination_id: selectedExaminationForPrescription.id,
        items: prescriptionItems
          .filter(item => item.medicine_id && item.quantity && item.dosage)
          .map(item => ({
             medicine_id: item.medicine_id,
             quantity: parseInt(item.quantity, 10),
             dosage: item.dosage,
             instruction: item.instruction || null,
          })),
      };

      if (payload.items.length === 0) {
        throw new Error("Pilih setidaknya satu obat dengan kuantitas dan dosis yang benar");
      }

      const response = await fetch(url, {
        method: isCreate ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || 'Gagal menyimpan resep');
      }

      handleClosePrescriptionDialog();
      fetchExaminations(page + 1, search);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, { medicine_id: '', quantity: '', dosage: '', instruction: '' }]);
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
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
                <StyledTableHeadCell align="center">Status Resep</StyledTableHeadCell>
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
                      {examination.prescription ? (
                        <Chip
                          label={examination.prescription.status === 'served' ? 'Dilayani' : 'Pending'}
                          color={examination.prescription.status === 'served' ? 'success' : 'warning'}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Belum ada</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ReceiptRoundedIcon />}
                        onClick={() => handleOpenPrescription(examination)}
                      >
                        Resep
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => handleOpenDialog(examination)}
                        disabled={examination.prescription?.status === 'served'}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        startIcon={<DeleteRoundedIcon />}
                        onClick={() => handleDeleteExamination(examination.id)}
                        disabled={examination.prescription?.status === 'served'}
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
            <Autocomplete
              options={patients}
              getOptionLabel={(option) => option.name}
              value={patients.find((p) => p.id === formData.patient_id) || null}
              onChange={(_, newValue) => {
                setFormData({ ...formData, patient_id: newValue ? newValue.id : '' });
              }}
              onInputChange={(_, newInputValue) => {
                setPatientInputValue(newInputValue);
              }}
              renderInput={(params) => <TextField {...params} label="Pasien" fullWidth required />}
            />
            <TextField
              label="Temuan"
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
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
            <Box>
              <Button variant="outlined" component="label" fullWidth sx={{ justifyContent: 'flex-start' }}>
                {formData.document ? formData.document.name : 'Unggah Dokumen (Opsional)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, document: e.target.files[0] });
                    }
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Batal</Button>
            <Button variant="contained" onClick={handleSaveExamination}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Prescription Dialog */}
        <Dialog open={openPrescriptionDialog} onClose={handleClosePrescriptionDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Resep Obat {selectedExaminationForPrescription?.patient?.name ? `- ${selectedExaminationForPrescription.patient.name}` : ''}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loadingPrescription ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Resep bisa diubah selama statusnya belum dilayani (served).
                </Alert>
                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Obat</TableCell>
                        <TableCell width="12%">Kuantitas</TableCell>
                        <TableCell width="20%">Dosis</TableCell>
                        <TableCell width="25%">Instruksi (opsional)</TableCell>
                        <TableCell width="5%"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prescriptionItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Autocomplete
                              options={medicines}
                              getOptionLabel={(option) => option.name}
                              value={medicines.find(m => m.id === item.medicine_id) || null}
                              onChange={(_, newValue) => {
                                const newItems = [...prescriptionItems];
                                newItems[index].medicine_id = newValue ? newValue.id : '';
                                setPrescriptionItems(newItems);
                              }}
                              onInputChange={(_, newInputValue) => {
                                setMedicineInputValue(newInputValue);
                              }}
                              renderInput={(params) => <TextField {...params} size="small" />}
                              disabled={selectedExaminationForPrescription?.prescription?.status === 'served'}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...prescriptionItems];
                                newItems[index].quantity = e.target.value;
                                setPrescriptionItems(newItems);
                              }}
                              disabled={selectedExaminationForPrescription?.prescription?.status === 'served'}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.dosage}
                              onChange={(e) => {
                                const newItems = [...prescriptionItems];
                                newItems[index].dosage = e.target.value;
                                setPrescriptionItems(newItems);
                              }}
                              placeholder="3 x 1 tablet"
                              disabled={selectedExaminationForPrescription?.prescription?.status === 'served'}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.instruction}
                              onChange={(e) => {
                                const newItems = [...prescriptionItems];
                                newItems[index].instruction = e.target.value;
                                setPrescriptionItems(newItems);
                              }}
                              placeholder="Sesudah makan"
                              disabled={selectedExaminationForPrescription?.prescription?.status === 'served'}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemovePrescriptionItem(index)}
                              disabled={selectedExaminationForPrescription?.prescription?.status === 'served'}
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {selectedExaminationForPrescription?.prescription?.status !== 'served' && (
                  <Button 
                    variant="outlined" 
                    startIcon={<AddRoundedIcon />} 
                    onClick={handleAddPrescriptionItem}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Tambah Obat
                  </Button>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePrescriptionDialog}>Tutup</Button>
            {selectedExaminationForPrescription?.prescription?.status !== 'served' && (
              <Button variant="contained" onClick={handleSavePrescription}>
                Simpan Resep
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
