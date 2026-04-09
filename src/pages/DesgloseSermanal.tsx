import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { computeWeeklySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addWeeks, format } from "date-fns";
import { es } from "date-fns/locale";

export default function DesgloseSermanal() {
  const { data } = useAppData();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDate = addWeeks(new Date(), weekOffset);
  const summary = computeWeeklySummary(data.cargas, data.gasolina, data.peajes, weekDate);

  const rows = [
    { label: "Total de cargas", value: summary.totalCargas.toString() },
    { label: "Millas totales", value: formatNumber(summary.millasTotal, 0) },
    { label: "Ingresos totales", value: formatMoney(summary.ingresosTotal), highlight: true },
  ];

  const gastos = [
    { label: "Gasolina", value: formatMoney(summary.gastoGasolina) },
    { label: "Comida", value: formatMoney(summary.gastoComida) },
    { label: "Hospedaje", value: formatMoney(summary.gastoHospedaje) },
    { label: "Peajes", value: formatMoney(summary.gastoPeajes) },
    { label: "Otros gastos", value: formatMoney(summary.otrosGastos) },
  ];

  const resultados = [
    { label: "Gastos totales", value: formatMoney(summary.gastosTotal), color: "text-destructive" },
    { label: "Ganancia neta", value: formatMoney(summary.gananciaNeta), color: summary.gananciaNeta >= 0 ? "text-success" : "text-destructive" },
    { label: "Ingreso promedio/carga", value: formatMoney(summary.ingresoPromedioPorCarga) },
    { label: "Ganancia/milla", value: formatMoney(summary.gananciaPorMilla) },
  ];

  return (
    <div className="pb-20">
      <PageHeader title="Desglose Semanal" />

      <div className="flex items-center justify-between px-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm font-medium">{summary.weekLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o + 1)} disabled={weekOffset >= 0}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <div className="px-4 space-y-4">
        {/* Activity */}
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Actividad</h3>
          {rows.map(r => (
            <div key={r.label} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={`font-medium ${r.highlight ? "text-primary" : ""}`}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Expenses */}
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Gastos</h3>
          {gastos.map(r => (
            <div key={r.label} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Resultados</h3>
          {resultados.map(r => (
            <div key={r.label} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={`font-bold ${r.color || ""}`}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
