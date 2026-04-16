import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  created_at: string;
}

interface UsersResponse {
  data: User[];
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

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning'> = {
  admin: 'error',
  resepsionis: 'primary',
  dokter: 'success',
  apoteker: 'warning',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  resepsionis: 'Resepsionis',
  dokter: 'Dokter',
  apoteker: 'Apoteker',
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'resepsionis' });
  const [passwordResetDialog, setPasswordResetDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async (pageNum: number = 1, searchValue: string = '', role: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: rowsPerPage.toString(),
      });

      if (searchValue) params.append('filters[search]', searchValue);
      if (role) params.append('filters[role]', role);

      const response = await fetch(`/users/list?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data pengguna');

      const data: UsersResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
      setPage(pageNum - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search, roleFilter);
  }, []);

  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchUsers(newPage + 1, search, roleFilter);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchUsers(1, search, roleFilter);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    fetchUsers(1, value, roleFilter);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(0);
    fetchUsers(1, search, value);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setDialogMode('edit');
      setSelectedUser(user);
      setFormData({ name: user.name, username: user.username, password: '', role: user.role });
    } else {
      setDialogMode('create');
      setSelectedUser(null);
      setFormData({ name: '', username: '', password: '', role: 'resepsionis' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', username: '', password: '', role: 'resepsionis' });
  };

  const handleSaveUser = async () => {
    try {
      const method = dialogMode === 'create' ? 'POST' : 'PUT';
      const url = dialogMode === 'create' ? '/users' : `/users/${selectedUser?.id}`;

      const payload = {
        ...formData,
        ...(dialogMode === 'create' && { password_confirmation: formData.password }),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal menyimpan pengguna');

      handleCloseDialog();
      fetchUsers(page + 1, search, roleFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      const response = await fetch(`/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus pengguna');
      fetchUsers(page + 1, search, roleFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;

    try {
      const response = await fetch(`/users/${resetPasswordUser.id}/reset-password`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Gagal reset password');

      const data = await response.json();
      setNewPassword(data.new_password);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Layout>
      <Box sx={{width: '100%'}}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Manajemen Pengguna
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => handleOpenDialog()}
          >
            Tambah Pengguna
          </Button>
        </Box>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
            label="Cari nama atau username"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Filter Peran</InputLabel>
            <Select
                value={roleFilter}
                label="Filter Peran"
                onChange={(e) => handleRoleFilter(e.target.value)}
                size="small"
            >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="resepsionis">Resepsionis</MenuItem>
                <MenuItem value="dokter">Dokter</MenuItem>
                <MenuItem value="apoteker">Apoteker</MenuItem>
            </Select>
            </FormControl>
            <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => fetchUsers(1, search, roleFilter)}
            >
            Segarkan
            </Button>
        </Stack>

        {/* Error Alert */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Table */}
        <TableContainer sx={{ maxHeight: '600px', mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table stickyHeader>
            <TableHead>
            <TableRow>
                <StyledTableHeadCell>Nama</StyledTableHeadCell>
                <StyledTableHeadCell>Username</StyledTableHeadCell>
                <StyledTableHeadCell>Peran</StyledTableHeadCell>
                <StyledTableHeadCell align="right"></StyledTableHeadCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {loading ? (
                <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                </TableCell>
                </TableRow>
            ) : users.length === 0 ? (
                <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">Tidak ada data pengguna</Typography>
                </TableCell>
                </TableRow>
            ) : (
                users.map((user) => (
                <TableRow key={user.id} sx={{backgroundColor: 'white'}}>
                    <StyledTableCell>{user.name}</StyledTableCell>
                    <StyledTableCell>{user.username}</StyledTableCell>
                    <StyledTableCell>
                    <Chip
                        label={roleLabels[user.role] || user.role}
                        size="small"
                        color={roleColors[user.role] as any}
                        variant="outlined"
                    />
                    </StyledTableCell>
                    <TableCell align="center">
                        <Stack direction={"row"} spacing={1} sx={{
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}>
                            <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(user)}
                                title="Edit"
                            >
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => {
                                setResetPasswordUser(user);
                                setPasswordResetDialog(true);
                                setNewPassword('');
                                }}
                                title="Reset Password"
                            >
                                <VpnKeyRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Hapus"
                            >
                                <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
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
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        />

        {/* User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Nama"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Username"
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              {dialogMode === 'create' && (
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              )}
              <FormControl fullWidth>
                <InputLabel>Peran</InputLabel>
                <Select
                  value={formData.role}
                  label="Peran"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="resepsionis">Resepsionis</MenuItem>
                  <MenuItem value="dokter">Dokter</MenuItem>
                  <MenuItem value="apoteker">Apoteker</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Batal</Button>
            <Button variant="contained" onClick={handleSaveUser}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={passwordResetDialog} onClose={() => setPasswordResetDialog(false)}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Pengguna: <strong>{resetPasswordUser?.name}</strong>
            </Typography>
            {newPassword && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Password baru: <strong>{newPassword}</strong>
              </Alert>
            )}
            {!newPassword && (
              <Typography color="textSecondary">
                Klik tombol "Reset" untuk generate password baru.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordResetDialog(false)}>Tutup</Button>
            {!newPassword && (
              <Button variant="contained" onClick={handleResetPassword}>
                Reset
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
