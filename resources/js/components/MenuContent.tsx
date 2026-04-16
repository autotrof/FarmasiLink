import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { HomeTwoTone, MedicationLiquidTwoTone, PersonTwoTone, ReceiptTwoTone, SettingsTwoTone } from '@mui/icons-material';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
// import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
// import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Dashboard', icon: <HomeTwoTone />, href: '/' },
  { text: 'Pengguna', icon: <PersonTwoTone />, href: '/users' },
  { text: 'Data Obat', icon: <MedicationLiquidTwoTone />, href: '/medicines' },
  { text: 'Log', icon: <ReceiptTwoTone />, href: '/my-logs' },
];

// const secondaryListItems = [
//   { text: 'Pengaturan', icon: <SettingsTwoTone /> },
//   { text: 'About', icon: <InfoRoundedIcon /> },
//   { text: 'Feedback', icon: <HelpRoundedIcon /> },
// ];

export default function MenuContent() {
  const { url } = usePage();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={url === item.href || (url.includes('/users') && item.href === '/users')}
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
