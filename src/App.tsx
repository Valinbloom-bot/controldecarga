import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/pages/Dashboard";
import RegistroCarga from "@/pages/RegistroCarga";
import ControlGasolina from "@/pages/ControlGasolina";
import ControlPeajes from "@/pages/ControlPeajes";
import DesgloseSermanal from "@/pages/DesgloseSermanal";
import ResumenMensual from "@/pages/ResumenMensual";
import Metas from "@/pages/Metas";
import Configuracion from "@/pages/Configuracion";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-lg mx-auto min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cargas" element={<RegistroCarga />} />
              <Route path="/gasolina" element={<ControlGasolina />} />
              <Route path="/peajes" element={<ControlPeajes />} />
              <Route path="/semanal" element={<DesgloseSermanal />} />
              <Route path="/resumen" element={<ResumenMensual />} />
              <Route path="/metas" element={<Metas />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
