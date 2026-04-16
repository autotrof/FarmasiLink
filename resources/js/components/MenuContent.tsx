import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import {
  HomeTwoTone,
  MedicationLiquidTwoTone,
  PersonTwoTone,
  MedicalInformationTwoTone,
  AssignmentTwoTone,
  HistoryTwoTone,
} from '@mui/icons-material';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[];
}

type UserRole = 'admin' | 'dokter' | 'apoteker' | 'resepsionis';

interface AuthUser {
  id: number | string;
  name: string;
  username: string;
  role: UserRole;
}

const allMenuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <HomeTwoTone />, href: '/' },
  {
    text: 'Pasien',
    icon: <PersonTwoTone />,
    href: '/patients',
    roles: ['resepsionis', 'admin', 'dokter'],
  },
  {
    text: 'Pemeriksaan',
    icon: <MedicalInformationTwoTone />,
    href: '/examinations',
    roles: ['dokter', 'admin'],
  },
  {
    text: 'Resep',
    icon: <AssignmentTwoTone />,
    href: '/prescriptions',
    roles: ['dokter', 'apoteker', 'admin'],
  },
  {
    text: 'Data Obat',
    icon: <MedicationLiquidTwoTone />,
    href: '/medicines',
    roles: ['dokter', 'apoteker', 'admin'],
  },
  {
    text: 'Pengguna',
    icon: <PersonTwoTone />,
    href: '/users',
    roles: ['admin'],
  },
  {
    text: 'Log Aktivitas',
    icon: <HistoryTwoTone />,
    href: '/my-logs',
  },
];

function getVisibleMenuItems(userRole: UserRole): MenuItem[] {
  return allMenuItems.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles) return true;
    // If roles specified, only show if user's role is in the list
    return item.roles.includes(userRole);
  });
}

function isMenuActive(itemHref: string, currentUrl: string): boolean {
  if (currentUrl === itemHref) return true;
  // Check if current path starts with the menu item path
  if (itemHref !== '/' && currentUrl.startsWith(itemHref)) return true;
  return false;
}

export default function MenuContent() {
  const { url, props } = usePage<{ auth: { user: AuthUser | null } }>();
  const user = props.auth?.user;
  const userRole = user?.role || ('apoteker' as UserRole);

  const visibleMenuItems = getVisibleMenuItems(userRole);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {visibleMenuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={isMenuActive(item.href, url)}
              component={Link}
              href={item.href}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Stack>
  );
}
