import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Layout from '../Layout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface ProfileData {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface ProfilePageProps {
  profile: ProfileData;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

export default function Profile({ profile }: ProfilePageProps) {
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Semua field harus diisi');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch('/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal memperbarui password');
      }

      setSuccessMessage('Password berhasil diperbarui');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%'}}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Profile Information Section */}
        <StyledCard>
          <CardContent>
            <SectionTitle>Informasi Profil</SectionTitle>
            <Stack spacing={2}>
              <TextField
                label="Nama"
                value={profile?.name || ''}
                fullWidth
                disabled
                variant="outlined"
              />
              <TextField
                label="Username"
                value={profile?.username || ''}
                fullWidth
                disabled
                variant="outlined"
              />
              <TextField
                label="Role"
                value={
                  profile?.role === 'admin'
                    ? 'Admin'
                    : profile?.role === 'dokter'
                    ? 'Dokter'
                    : profile?.role === 'apoteker'
                    ? 'Apoteker'
                    : 'Resepsionis'
                }
                fullWidth
                disabled
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </StyledCard>

        {/* Password Update Section */}
        <StyledCard>
          <CardContent>
            <SectionTitle>Ubah Password</SectionTitle>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}

            <form onSubmit={handleUpdatePassword}>
              <Stack spacing={2}>
                <TextField
                  label="Password Saat Ini"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  disabled={passwordLoading}
                  slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                edge="end"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={passwordLoading}
                                >
                                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                  }}
                />

                <TextField
                  label="Password Baru"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  disabled={passwordLoading}
                  helperText="Minimal 8 karakter"
                  slotProps={{
                    input: {
                        endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                            edge="end"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={passwordLoading}
                            >
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </InputAdornment>
                        ),
                    }
                  }}
                />

                <TextField
                  label="Konfirmasi Password Baru"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  disabled={passwordLoading}
                  slotProps={{
                    input: {
                        endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                            edge="end"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={passwordLoading}
                            >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </InputAdornment>
                        ),
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={passwordLoading}
                  sx={{ mt: 1 }}
                >
                  {passwordLoading ? <CircularProgress size={24} /> : 'Simpan Password'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </StyledCard>
      </Box>
    </Layout>
  );
}
