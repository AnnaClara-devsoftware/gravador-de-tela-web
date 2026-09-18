import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/app/AppLayout';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { ToastProvider } from '@/hooks/useToast';
import { LandingPage } from '@/pages/LandingPage';
import { RecorderPage } from '@/pages/RecorderPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { CompatibilityPage } from '@/pages/CompatibilityPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="gravar" element={<RecorderPage />} />
              <Route path="gravacoes" element={<LibraryPage />} />
              <Route path="compatibilidade" element={<CompatibilityPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
