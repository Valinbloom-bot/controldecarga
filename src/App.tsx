import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import { PaymentFailedBanner } from "@/components/PaymentFailedBanner";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import RegistroCarga from "@/pages/RegistroCarga";
import ControlGasolina from "@/pages/ControlGasolina";
import ControlPeajes from "@/pages/ControlPeajes";
import GastosVehiculo from "@/pages/GastosVehiculo";
import DesgloseSermanal from "@/pages/DesgloseSermanal";
import ResumenMensual from "@/pages/ResumenMensual";
import DesgloseMes from "@/pages/Metas";
import Configuracion from "@/pages/Configuracion";
import Cuenta from "@/pages/Cuenta";
import Pricing from "@/pages/Pricing";
import Admin from "@/pages/Admin";
import Terminos from "@/pages/Terminos";
import Privacidad from "@/pages/Privacidad";
import Reembolsos from "@/pages/Reembolsos";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedShell = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      <PaymentFailedBanner />
      {children}
      <BottomNav />
    </div>
  </ProtectedRoute>
);

// Pricing has its own layout (with PaymentTestModeBanner) and must be reachable
// by unauthenticated visitors so they can review plans before signing up.
const PricingShell = () => (
  <div className="max-w-lg mx-auto min-h-screen bg-background">
    <Pricing />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/precios" element={<PricingShell />} />
              <Route path="/terminos" element={<Terminos />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/reembolsos" element={<Reembolsos />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected app */}
              <Route path="/panel" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
              <Route path="/cargas" element={<ProtectedShell><RegistroCarga /></ProtectedShell>} />
              <Route path="/gasolina" element={<ProtectedShell><ControlGasolina /></ProtectedShell>} />
              <Route path="/peajes" element={<ProtectedShell><ControlPeajes /></ProtectedShell>} />
              <Route path="/gastos-vehiculo" element={<ProtectedShell><GastosVehiculo /></ProtectedShell>} />
              <Route path="/semanal" element={<ProtectedShell><DesgloseSermanal /></ProtectedShell>} />
              <Route path="/resumen" element={<ProtectedShell><ResumenMensual /></ProtectedShell>} />
              <Route path="/metas" element={<ProtectedShell><DesgloseMes /></ProtectedShell>} />
              <Route path="/configuracion" element={<ProtectedShell><Configuracion /></ProtectedShell>} />
              <Route path="/cuenta" element={<ProtectedShell><Cuenta /></ProtectedShell>} />
              <Route path="/admin" element={<ProtectedShell><Admin /></ProtectedShell>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
