import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
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
        <Snackbar />
        <CssBaseline />
        <ErrorBoundary>
          <ConfirmDialog />
          <AuthInitializer />
          <UserProfileInitializer />
          <AppRoutes />
        </ErrorBoundary>
        <GlobalErrorHandler />
      </BrowserRouter>
    </ThemeProvider>
  </>
  )
}

export default App;