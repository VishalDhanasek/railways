import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ToastProvider } from '@/context/ToastContext';
import Dashboard from '@/pages/Dashboard';
import Alteration from '@/pages/Alteration';
import CoachAlteration from '@/pages/CoachAlteration';
import WagonAlteration from '@/pages/WagonAlteration';
import StockingApplication from '@/pages/StockingApplication';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alteration" element={<Alteration />} />
            <Route path="alteration/coach" element={<CoachAlteration />} />
            <Route path="alteration/wagon" element={<WagonAlteration />} />
            <Route path="stocking" element={<StockingApplication />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
