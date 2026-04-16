import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { BrowserRouter } from 'react-router-dom';
import { AuthInitializer } from './auth/AuthInitializer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { Snackbar } from './components/Snackbar';
import { UserProfileInitializer } from './components/UserProfileInitializer';
import { AppRoutes } from './routes';
import { theme } from './themes/theme';
import { isUS } from './utils/helper.ts';
dayjs.extend(isoWeek);

function App() {
  return (<>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={isUS() ? 'en' : 'en-gb'}>
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