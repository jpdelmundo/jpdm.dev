import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { AuthInitializer } from './auth/AuthInitializer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { GlobalSnackbar } from './components/GlobalSnackbar';
import { AppRoutes } from './routes';
import { theme } from './themes/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <GlobalSnackbar />
        <CssBaseline />
        <ErrorBoundary>
          <AuthInitializer />
          <AppRoutes />
        </ErrorBoundary>
        <GlobalErrorHandler />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;