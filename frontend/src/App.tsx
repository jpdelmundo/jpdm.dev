import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BrowserRouter } from 'react-router-dom';
import { AuthInitializer } from './auth/AuthInitializer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { GradientBg } from './components/GradientBg';
import { Snackbar } from './components/Snackbar';
import { UserProfileInitializer } from './components/UserProfileInitializer';
import { AppRoutes } from './routes';
import { theme } from './themes/theme';

function App() {
  return (<>
    <GradientBg />
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjs.locale()}>
          <Snackbar />
          <CssBaseline />
          <ErrorBoundary>
            <ConfirmDialog />
            <AuthInitializer />
            <UserProfileInitializer />
            <AppRoutes />
          </ErrorBoundary>
          <GlobalErrorHandler />
        </LocalizationProvider>
      </BrowserRouter>
    </ThemeProvider >
  </>
  )
}

export default App;