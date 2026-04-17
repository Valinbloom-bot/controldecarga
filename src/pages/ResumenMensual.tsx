import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { computeMonthlySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { exportResumenMensualCSV, exportResumenMensualPDF } from "@/lib/exports";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText } from "lucide-react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function ResumenMensual() {
  const { data } = useAppData();
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = addMonths(new Date(), monthOffset);
  const yearMonth = format(monthDate, "yyyy-MM");
  const monthLabel = format(monthDate, "MMMM yyyy", { locale: es });
  const summary = computeMonthlySummary(data.cargas, data.gasolina, data.peajes, yearMonth);

  return (
    <div className="pb-20">
      <PageHeader
        title="Resumen General"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                try { exportResumenMensualCSV(data.cargas, data.gasolina, data.peajes, yearMonth); toast.success("Exportación lista"); }
                catch (e) { console.error(e); toast.error("Error al exportar"); }
              }}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                try { exportResumenMensualPDF(data.cargas, data.gasolina, data.peajes, yearMonth); toast.success("Exportación lista"); }
                catch (e) { console.error(e); toast.error("Error al exportar"); }
              }}>
                <FileText className="w-4 h-4 mr-2" /> Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="flex items-center justify-between px-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setMonthOffset(o => o - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Actividad</h3>
          {[
            ["Total de cargas", summary.totalCargas],
            ["Días trabajados", summary.diasTrabajados],
            ["Millas recorridas", formatNumber(summary.millasTotal, 0)],
            ["Total ingresos", formatMoney(summary.ingresosTotal)],
            ["Promedio/carga", formatMoney(summary.ingresoPromedioPorCarga)],
            ["Ganancia/milla", formatMoney(summary.gananciaPorMilla)],
          ].map(([l, v]) => (
            <div key={l as string} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Gastos</h3>
          {[
            ["Gasolina", summary.gastoGasolina],
            ["Comida", summary.gastoComida],
            ["Hospedaje", summary.gastoHospedaje],
            ["Peajes", summary.gastoPeajes],
            ["Otros", summary.otrosGastos],
          ].map(([l, v]) => (
            <div key={l as string} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-medium">{formatMoney(v as number)}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Resultados</h3>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Gastos totales</span>
            <span className="font-bold text-destructive">{formatMoney(summary.gastosTotal)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Ganancia neta</span>
            <span className={`font-bold text-lg ${summary.gananciaNeta >= 0 ? "text-success" : "text-destructive"}`}>{formatMoney(summary.gananciaNeta)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
