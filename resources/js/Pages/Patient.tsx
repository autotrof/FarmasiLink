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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Layout from '../Layout';
import { usePage } from '@inertiajs/react';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

interface Patient {
  id: string;
  patient_number: string;
  name: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  address: string | null;
  medical_history: string | null;
  created_at: string;
}

interface PatientsResponse {
  data: Patient[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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

export default function Patient() {
  const { auth } = usePage().props as any;
  const userRole = auth?.user?.role;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [searchName, setSearchName] = useState('');
  const [searchPatientNumber, setSearchPatientNumber] = useState('');

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Register states
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    address: '',
    medical_history: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Edit states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    patient_number: '',
    name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    address: '',
    medical_history: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async () => {
    setRegisterLoading(true);
    setRegisterError(null);
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      const response = await fetch('/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        body: JSON.stringify(registerForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal registrasi pasien');
      }

      setOpenRegisterDialog(false);
      setRegisterForm({
        name: '',
        date_of_birth: '',
        gender: 'male',
        phone: '',
        address: '',
        medical_history: '',
      });
      fetchPatients(1, searchName, searchPatientNumber); // Refresh table
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditError(null);
    setEditForm({
      id: patient.id,
      patient_number: patient.patient_number,
      name: patient.name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      phone: patient.phone || '',
      address: patient.address || '',
      medical_history: patient.medical_history || '',
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      // Remove id from payload
      const { id, ...payload } = editForm;
      
      const response = await fetch(`/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Gagal mengubah data pasien';
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
          if (errorData.errors) {
             const firstErrorKey = Object.keys(errorData.errors)[0];
             errorMessage = errorData.errors[firstErrorKey][0];
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      setOpenEditDialog(false);
      fetchPatients(page + 1, searchName, searchPatientNumber); // Refresh table
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah data');
    } finally {
      setEditLoading(false);
    }
  };

  const fetchPatients = async (pageNum: number = 1, nameValue: string = '', numberValue: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: rowsPerPage.toString(),
      });

      if (nameValue) params.append('name', nameValue);
      if (numberValue) params.append('patient_number', numberValue);

      const response = await fetch(`/patients/list?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data pasien');

      const data: PatientsResponse = await response.json();
      setPatients(data.data);
      setTotalPatients(data.total);
      setPage(pageNum - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1, searchName, searchPatientNumber);
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchPatients(newPage + 1, searchName, searchPatientNumber);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchPatients(1, searchName, searchPatientNumber);
  };

  const handleSearch = () => {
    setPage(0);
    fetchPatients(1, searchName, searchPatientNumber);
  };

  const handleClearSearch = () => {
    setSearchName('');
    setSearchPatientNumber('');
    setPage(0);
    fetchPatients(1, '', '');
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenDetailDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Daftar Pasien
          </Typography>
          {(userRole === 'admin' || userRole === 'resepsionis') && (
            <Button variant="contained" color="primary" onClick={() => setOpenRegisterDialog(true)}>
              Registrasi Pasien
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Cari Nomor RM"
            variant="outlined"
            size="small"
            value={searchPatientNumber}
            onChange={(e) => setSearchPatientNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <TextField
            label="Cari nama pasien"
            variant="outlined"
            size="small"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
          >
            Cari
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={handleClearSearch}
          >
            Reset
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Table */}
        <TableContainer sx={{ maxHeight: '600px', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Nomor RM</StyledTableHeadCell>
                <StyledTableHeadCell>Waktu Daftar</StyledTableHeadCell>
                <StyledTableHeadCell>Nama Pasien</StyledTableHeadCell>
                <StyledTableHeadCell>Jenis Kelamin</StyledTableHeadCell>
                <StyledTableHeadCell>No. Telepon</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Aksi</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">Tidak ada data pasien</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} sx={{ backgroundColor: 'white' }}>
                    <StyledTableCell>{patient.patient_number}</StyledTableCell>
                    <TableCell>{patient.created_at ? formatDateTime(patient.created_at) : '-'}</TableCell>
                    <StyledTableCell>{patient.name}</StyledTableCell>
                    <TableCell>{patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(patient)}
                        title="Lihat Detail"
                      >
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                      {(userRole === 'admin' || userRole === 'resepsionis') && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(patient)}
                          title="Edit Pasien"
                          color="primary"
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
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
          count={totalPatients}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        />

        {/* Detail Dialog */}
        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Detail Pasien</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Nomor Rekam Medis (RM)
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                  {selectedPatient?.patient_number}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Waktu Daftar
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient?.created_at ? formatDateTime(selectedPatient.created_at) : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Nama Pasien
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient?.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Tanggal Lahir
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient ? formatDate(selectedPatient.date_of_birth) : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Jenis Kelamin
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Nomor Telepon
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient?.phone || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Alamat
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient?.address || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Riwayat Medis
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPatient?.medical_history || '-'}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
          </DialogActions>
        </Dialog>

        {/* Register Dialog */}
        <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Registrasi Pasien Baru</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {registerError && <Alert severity="error">{registerError}</Alert>}
              <TextField
                label="Nama Pasien"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Tanggal Lahir"
                name="date_of_birth"
                type="date"
                value={registerForm.date_of_birth}
                onChange={handleRegisterChange}
                fullWidth
                required
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>Jenis Kelamin</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={registerForm.gender}
                  onChange={handleRegisterChange}
                >
                  <FormControlLabel value="male" control={<Radio size="small" />} label="Laki-laki" />
                  <FormControlLabel value="female" control={<Radio size="small" />} label="Perempuan" />
                </RadioGroup>
              </FormControl>
              <TextField
                label="Nomor Telepon"
                name="phone"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                fullWidth
                size="small"
              />
              <TextField
                label="Alamat"
                name="address"
                value={registerForm.address}
                onChange={handleRegisterChange}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
              <TextField
                label="Riwayat Medis"
                name="medical_history"
                value={registerForm.medical_history}
                onChange={handleRegisterChange}
                fullWidth
                multiline
                minRows={4}
                size="small"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRegisterDialog(false)} disabled={registerLoading}>Batal</Button>
            <Button onClick={handleRegisterSubmit} variant="contained" disabled={registerLoading}>
              {registerLoading ? <CircularProgress size={24} /> : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Data Pasien</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {editError && <Alert severity="error">{editError}</Alert>}
              <TextField
                label="Nama Pasien"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Tanggal Lahir"
                name="date_of_birth"
                type="date"
                value={editForm.date_of_birth}
                onChange={handleEditChange}
                fullWidth
                required
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>Jenis Kelamin</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                >
                  <FormControlLabel value="male" control={<Radio size="small" />} label="Laki-laki" />
                  <FormControlLabel value="female" control={<Radio size="small" />} label="Perempuan" />
                </RadioGroup>
              </FormControl>
              <TextField
                label="Nomor Telepon"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                fullWidth
                size="small"
              />
              <TextField
                label="Alamat"
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
              <TextField
                label="Riwayat Medis"
                name="medical_history"
                value={editForm.medical_history}
                onChange={handleEditChange}
                fullWidth
                multiline
                minRows={4}
                size="small"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} disabled={editLoading}>Batal</Button>
            <Button onClick={handleEditSubmit} variant="contained" disabled={editLoading}>
              {editLoading ? <CircularProgress size={24} /> : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
