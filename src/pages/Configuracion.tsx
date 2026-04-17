import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, FileText, FileSpreadsheet, Truck, Fuel, CreditCard, BarChart3, FileDown } from "lucide-react";
import {
  exportCargasCSV, exportCargasPDF,
  exportGasolinaCSV, exportGasolinaPDF,
  exportPeajesCSV, exportPeajesPDF,
  exportResumenMensualCSV, exportResumenMensualPDF,
  exportNegocioCompletoPDF,
} from "@/lib/exports";
import { format } from "date-fns";
import { toast } from "sonner";

interface RowProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  onCSV: () => void;
  onPDF: () => void;
  disabled?: boolean;
}

function ExportRow({ icon, title, count, onCSV, onPDF, disabled }: RowProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{count} registro{count === 1 ? "" : "s"}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" disabled={disabled} onClick={onCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
        </Button>
        <Button size="sm" variant="outline" disabled={disabled} onClick={onPDF}>
          <FileText className="w-4 h-4 mr-1" /> PDF
        </Button>
      </div>
    </div>
  );
}

export default function Configuracion() {
  const { data, toggleDarkMode } = useAppData();
  const [mes, setMes] = useState(format(new Date(), "yyyy-MM"));

  const safe = (fn: () => void, emptyMsg: string, isEmpty: boolean) => () => {
    if (isEmpty) { toast.error(emptyMsg); return; }
    try { fn(); toast.success("Exportación lista"); }
    catch (e) { toast.error("Error al exportar"); console.error(e); }
  };

  return (
    <div className="pb-20">
      <PageHeader title="Configuración" />
      <div className="px-4 space-y-4">
        {/* Dark mode */}
        <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <Label>Modo oscuro</Label>
          </div>
          <Switch checked={data.darkMode} onCheckedChange={toggleDarkMode} />
        </div>

        {/* Exports */}
        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Exportar datos</h2>
          <div className="space-y-2">
            <ExportRow
              icon={<Truck className="w-5 h-5" />}
              title="Cargas"
              count={data.cargas.length}
              onCSV={safe(() => exportCargasCSV(data.cargas), "No hay cargas", data.cargas.length === 0)}
              onPDF={safe(() => exportCargasPDF(data.cargas), "No hay cargas", data.cargas.length === 0)}
            />
            <ExportRow
              icon={<Fuel className="w-5 h-5" />}
              title="Gasolina"
              count={data.gasolina.length}
              onCSV={safe(() => exportGasolinaCSV(data.gasolina), "No hay gasolina", data.gasolina.length === 0)}
              onPDF={safe(() => exportGasolinaPDF(data.gasolina), "No hay gasolina", data.gasolina.length === 0)}
            />
            <ExportRow
              icon={<CreditCard className="w-5 h-5" />}
              title="Peajes"
              count={data.peajes.length}
              onCSV={safe(() => exportPeajesCSV(data.peajes), "No hay peajes", data.peajes.length === 0)}
              onPDF={safe(() => exportPeajesPDF(data.peajes), "No hay peajes", data.peajes.length === 0)}
            />
          </div>
        </div>

        {/* Monthly summary export */}
        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Resumen mensual</h2>
          <div className="bg-card border border-border rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Mes</Label>
                <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={safe(
                () => exportResumenMensualCSV(data.cargas, data.gasolina, data.peajes, mes),
                "Selecciona un mes válido", !mes
              )}>
                <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={safe(
                () => exportResumenMensualPDF(data.cargas, data.gasolina, data.peajes, mes),
                "Selecciona un mes válido", !mes
              )}>
                <FileText className="w-4 h-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Full business export */}
        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Reporte completo</h2>
          <div className="bg-card border border-border rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Todo el negocio en un PDF</div>
                <div className="text-xs text-muted-foreground">Resumen + cargas + gasolina + peajes</div>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={safe(
                () => exportNegocioCompletoPDF(data.cargas, data.gasolina, data.peajes, mes || undefined),
                "No hay datos",
                data.cargas.length === 0 && data.gasolina.length === 0 && data.peajes.length === 0,
              )}
            >
              <FileDown className="w-4 h-4 mr-1" /> Exportar PDF completo
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Acerca de</h3>
          <p className="text-xs text-muted-foreground">Control de Cargas v1.0</p>
          <p className="text-xs text-muted-foreground">App para transportistas independientes</p>
        </div>
      </div>
    </div>
  );
}
