import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import AlertDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import { router, usePage } from '@inertiajs/react';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
  const { props } = usePage();
  const user = (props.auth as any)?.user;

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setOpenLogoutDialog(false);
    fetch('/logout', {
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          router.visit('/login');
        } else {
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Error during logout:', error);
      });
  };

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={user?.name || 'User'}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 24, height: 24 }}
            />
            <Stack sx={{ gap: 0 }}>
              <Typography component="p" variant="h6" sx={{ lineHeight: 1 }}>
                {user?.name || 'Guest'}
              </Typography>
              <Typography component="p" variant="caption" sx={{ color: 'text.secondary' }}>
                @{user?.username || 'username'}
              </Typography>
            </Stack>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogoutClick}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      <AlertDialog
        open={openLogoutDialog}
        onClose={handleCancelLogout}
      >
        <DialogTitle>Konfirmasi Logout</DialogTitle>
        <DialogContent>
          Apakah Anda yakin ingin keluar dari aplikasi?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout}>Batal</Button>
          <Button onClick={handleConfirmLogout} variant="contained" color="error">
            Logout
          </Button>
        </DialogActions>
      </AlertDialog>
    </Drawer>
  );
}
