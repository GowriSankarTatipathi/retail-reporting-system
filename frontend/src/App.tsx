import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeModeProvider } from '@/contexts/ThemeModeContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { router } from '@/routes/router';

function App() {
  return (
    <ErrorBoundary>
      <ThemeModeProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <AuthProvider>
            <OfflineBanner />
            <RouterProvider router={router} />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeModeProvider>
    </ErrorBoundary>
  );
}

export default App;
