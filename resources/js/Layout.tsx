import AppTheme from './shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import SideMenu from './components/SideMenu';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import { Box, Stack } from '@mui/material';

export default function Layout(props: {
    children: React.ReactNode;
}) {
    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                <SideMenu />
                <AppNavbar />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                        ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                        : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                    })}
                    >
                    <Stack
                        spacing={2}
                        sx={{
                        alignItems: 'center',
                        mx: 3,
                        pb: 5,
                        mt: { xs: 8, md: 0 },
                        }}>
                            <Header />
                            {props.children}
                            {/* <MainGrid /> */}
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}
