import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/zh';
import isoWeek from 'dayjs/plugin/isoWeek';
import ReactGA from 'react-ga4';
import { BrowserRouter } from 'react-router-dom';
import { AuthInitializer } from './auth/AuthInitializer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { PageViewTracker } from './components/PageViewTracker.tsx';
import { ScrollToTop } from './components/ScrollToTop';
import { Snackbar } from './components/Snackbar';
import { UserProfileInitializer } from './components/UserProfileInitializer';
import { AppRoutes } from './routes.tsx';
import { theme } from './themes/theme';

dayjs.extend(isoWeek);

const GA_ID = import.meta.env.VITE_GA_ID;
GA_ID && ReactGA.initialize(GA_ID);

const SUPPORTED_LOCALE = ['en', 'ja', 'ko', 'zh'];
const [adapterLocale] = navigator.language.split('-');
function App() {
  return (<>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ScrollToTop />
        {GA_ID && <PageViewTracker />}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={SUPPORTED_LOCALE.includes(adapterLocale) ? adapterLocale : 'en'}>
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