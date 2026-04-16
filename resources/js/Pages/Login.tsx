import { useEffect, useState, useActionState } from 'react';
import {Box, Button, Card as MuiCard, FormLabel, FormControl, Link, TextField, Typography, Stack, Grid, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert} from '@mui/material';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import { z } from 'zod';
import { AssignmentInd, LockTwoTone, VisibilityOffTwoTone, VisibilityTwoTone } from '@mui/icons-material';
import { router } from "@inertiajs/react";

const LoginFormSchema = z.object({
  username: z.string().min(3, 'Username harus diisi. minimal 3 karakter'),
  password: z.string().min(6, 'Password harus diisi. minimal 6 karakter'),
});

type LoginData = {
    errors?: {
        username?: string[];
        password?: string[];
    };
    fields: {
        username: string;
        password: string;
    };
    message?: string;
    success?: boolean;
};

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

async function doLogin(_prevState: unknown, formData: FormData) : Promise<LoginData> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const validatedFields = LoginFormSchema.safeParse({
        username,
        password,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            fields: {
                username: username || '',
                password: password || '',
            },
            message: 'Periksa kembali data yang anda masukkan',
        };
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                username: validatedFields.data.username,
                password: validatedFields.data.password,
            }),
        });

        if (response.ok) {
            return {
                fields: validatedFields.data,
                message: 'Login berhasil',
                success: true,
            };
        }

        const data = await response.json();

        if (response.status === 422) {
            return {
                errors: data.errors || {},
                fields: validatedFields.data,
                message: data.message || 'Validasi gagal',
            };
        }

        return {
            errors: data.errors || { username: ['Terjadi kesalahan. Silakan coba lagi.'] },
            fields: validatedFields.data,
            message: data.message || 'Login gagal',
        };
    } catch (error) {
        return {
            errors: { username: ['Terjadi kesalahan jaringan. Silakan coba lagi.'] },
            fields: validatedFields.data,
            message: 'Terjadi kesalahan',
        };
    }
}

export default function Login(props: { disableCustomTheme?: boolean }) {
  const [loginData, formAction, isSending] = useActionState(doLogin, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (loginData?.success) {
      setShowSuccessAlert(true);
      const timer = setTimeout(() => {
        router.visit('/', {
            replace: true,
        })
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loginData?.success, router]);

  return (
    <AppTheme {...props}>
        <Box sx={{width: '100%'}}>
            <Stack
                direction='column'
                component='main'
                sx={[
                    {
                        justifyContent: 'center',
                        height: 'calc((1 - var(--template-frame-height, 0)) * 100%)',
                        marginTop: 'max(40px - var(--template-frame-height, 0px), 0px)',
                        minHeight: '100%',
                    },
                    (theme) => ({
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            zIndex: -1,
                            inset: 0,
                            backgroundImage:
                                'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
                            backgroundRepeat: 'no-repeat',
                            ...theme.applyStyles('dark', {
                                backgroundImage:
                                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
                            }),
                        },
                    })
                ]}>
                    <Stack
                        sx={{
                            position: 'relative',
                            justifyContent: 'center',
                            gap: { xs: 6, sm: 12 },
                            p: 2,
                            mx: 'auto',
                            mt: showSuccessAlert ? 8 : 0,
                        }}>
                        {showSuccessAlert && (
                            <Box sx={{ position: 'absolute', top: -70, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: 300 }}>
                                <Alert severity="success">
                                    {loginData?.message || 'Login berhasil'}
                                </Alert>
                            </Box>
                        )}
                        <Card variant="outlined">
                            <Grid container spacing={1}  >
                                <Grid size={2}>
                                    <img src="/logo-rs.png" alt="Logo RS" />
                                </Grid>
                                <Grid size={10}>
                                    <Typography variant="h6" color="text.secondary">
                                        Aplikasi Peresepan Obat
                                    </Typography>
                                    <Typography color="text.secondary">
                                        RS Arafah Anwar Medika
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider></Divider>
                            <Box
                                component="form"
                                action={formAction}
                                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
                                <FormControl>
                                <FormLabel htmlFor="username">Username</FormLabel>
                                <TextField
                                    error={loginData?.errors?.username ? true : false}
                                    helperText={
                                        loginData?.errors?.username?.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        )) || ''
                                    }
                                    id='username'
                                    type="text"
                                    name="username"
                                    placeholder=""
                                    autoComplete="username"
                                    autoFocus
                                    defaultValue={loginData?.fields.username || ''}
                                    fullWidth
                                    variant="outlined"
                                    color={loginData?.errors?.username ? 'error' : 'primary'}
                                    slotProps={{
                                        input: {
                                            startAdornment: <AssignmentInd color='disabled' sx={{width: '20px', height: '20px', marginRight: 1}}/>,
                                        }
                                    }}
                                />
                                </FormControl>
                                <FormControl>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <FormLabel htmlFor="password">Password</FormLabel>
                                    <Link
                                        tabIndex={-1}
                                        variant="body2"
                                        sx={{ alignSelf: 'baseline' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setOpenForgotPasswordDialog(true);
                                        }}>
                                        lupa password?
                                    </Link>
                                </Box>
                                <TextField
                                    error={loginData?.errors?.password ? true : false}
                                    helperText={
                                        loginData?.errors?.password?.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        )) || ''
                                    }
                                    name="password"
                                    placeholder="******"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    defaultValue={loginData?.fields.password || ''}
                                    fullWidth
                                    variant="outlined"
                                    color={loginData?.errors?.password ? 'error' : 'primary'}
                                    slotProps={{
                                        input: {
                                            startAdornment: <LockTwoTone color='disabled' sx={{width: '20px', height: '20px', marginRight: 1}}/>,
                                            endAdornment: showPassword ? <VisibilityOffTwoTone color='disabled' sx={{width: '20px', height: '20px', marginLeft: 1, cursor: 'pointer'}} onClick={() => setShowPassword(!showPassword)}/> : <VisibilityTwoTone color='disabled' sx={{width: '20px', height: '20px', marginLeft: 1, cursor: 'pointer'}} onClick={() => setShowPassword(!showPassword)}/>,
                                        }
                                    }}
                                />
                                </FormControl>
                                <Button
                                    loading={isSending}
                                    loadingIndicator={
                                        <CircularProgress color="info" size={20} />
                                    }
                                    disabled={isSending}
                                    type="submit"
                                    fullWidth
                                    variant="contained">
                                    Masuk
                                </Button>
                            </Box>
                        </Card>
                    </Stack>
            </Stack>
        </Box>
        <Dialog open={openForgotPasswordDialog} onClose={() => setOpenForgotPasswordDialog(false)}>
            <DialogTitle>Lupa Password</DialogTitle>
            <DialogContent>
                <Typography sx={{ mt: 2 }}>
                    Silahkan informasikan ke admin agar admin me-reset password anda.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenForgotPasswordDialog(false)} variant="contained">
                    Tutup
                </Button>
            </DialogActions>
        </Dialog>
    </AppTheme>
  );
}
