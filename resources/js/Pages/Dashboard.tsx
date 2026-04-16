import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Layout from '../Layout';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import dayjs, { Dayjs } from 'dayjs';

interface DashboardStats {
  total_patients: number;
  examination_count: number;
  medicine_purchase_total: number;
  month: number;
  year: number;
}

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}

function StatItem({ icon, label, value, bgColor, iconColor }: StatItemProps) {
  return (
    <StatCard>
      <CardContent>
        <IconBox sx={{ backgroundColor: bgColor }}>
          <Box sx={{ color: iconColor, display: 'flex', fontSize: '32px' }}>
            {icon}
          </Box>
        </IconBox>
        <StatValue>{value}</StatValue>
        <StatLabel>{label}</StatLabel>
      </CardContent>
    </StatCard>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const fetchStats = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/dashboard-stats?month=${month}&year=${year}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data: DashboardStats = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedDate.month() + 1, selectedDate.year());
  }, [selectedDate]);

  const handleDateConfirm = () => {
    setOpenDatePicker(false);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const monthYearLabel = selectedDate.format('MMMM YYYY');

  return (
    <Layout>
      <Box
        sx={{
          width: '100%',
          maxWidth: '1700px',
        }}
      >
        {/* Header Section */}
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
          }}
          spacing={2}
        >
          <Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />
              {monthYearLabel}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setOpenDatePicker(true)}
            startIcon={<CalendarTodayRoundedIcon />}
          >
            Ubah Bulan
          </Button>
        </Stack>

        {/* Date Picker Dialog */}
        <Dialog open={openDatePicker} onClose={() => setOpenDatePicker(false)}>
          <DialogTitle>Pilih Bulan dan Tahun</DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Stack spacing={2} sx={{ minWidth: 300 }}>
              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Bulan
                </Typography>
                <Select
                  value={selectedDate.month() + 1}
                  onChange={(e) => {
                    setSelectedDate(selectedDate.month(e.target.value as number - 1));
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {dayjs().month(i).format('MMMM')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Tahun
                </Typography>
                <Select
                  value={selectedDate.year()}
                  onChange={(e) => {
                    setSelectedDate(selectedDate.year(e.target.value as number));
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = dayjs().year() - 5 + i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDatePicker(false)}>Batal</Button>
            <Button
              onClick={handleDateConfirm}
              variant="contained"
              color="primary"
            >
              Terapkan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Stats Grid */}
        {!loading && stats && (
          <Grid container spacing={3}>
            {/* Total Patients */}
            <Grid size={{
                sm: 12,
                md: 4,
            }}>
              <StatItem
                icon={<PeopleAltRoundedIcon sx={{ fontSize: 32 }} />}
                label="Total Pasien"
                value={stats.total_patients}
                bgColor={
                  theme.palette.mode === 'light'
                    ? 'rgba(25, 118, 210, 0.08)'
                    : 'rgba(25, 118, 210, 0.16)'
                }
                iconColor={theme.palette.primary.main}
              />
            </Grid>

            {/* Examination Count */}
            <Grid size={{
                sm: 12,
                md: 4,
            }}>
              <StatItem
                icon={<MedicalServicesRoundedIcon sx={{ fontSize: 32 }} />}
                label={`Pemeriksaan (${monthYearLabel})`}
                value={stats.examination_count}
                bgColor={
                  theme.palette.mode === 'light'
                    ? 'rgba(56, 142, 60, 0.08)'
                    : 'rgba(56, 142, 60, 0.16)'
                }
                iconColor={theme.palette.success.main}
              />
            </Grid>

            {/* Medicine Purchase Total */}
            <Grid size={{
                sm: 12,
                md: 4,
            }}>
              <StatItem
                icon={<LocalPharmacyRoundedIcon sx={{ fontSize: 32 }} />}
                label={`Penjualan Obat (${monthYearLabel})`}
                value={formatCurrency(stats.medicine_purchase_total)}
                bgColor={
                  theme.palette.mode === 'light'
                    ? 'rgba(245, 127, 23, 0.08)'
                    : 'rgba(245, 127, 23, 0.16)'
                }
                iconColor={theme.palette.warning.main}
              />
            </Grid>
          </Grid>
        )}

        {/* Empty State */}
        {!loading && !stats && (
          <Alert severity="info">Tidak ada data untuk ditampilkan</Alert>
        )}
      </Box>
    </Layout>
  );
}
