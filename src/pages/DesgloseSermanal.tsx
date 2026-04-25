import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { computeWeeklySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addWeeks } from "date-fns";

export default function DesgloseSermanal() {
  const { data } = useAppData();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDate = addWeeks(new Date(), weekOffset);
  const summary = computeWeeklySummary(data.cargas, data.gasolina, data.peajes, weekDate, data.gastosVehiculo);

  const rows = [
    { label: "Total loads", value: summary.totalCargas.toString() },
    { label: "Total miles", value: formatNumber(summary.millasTotal, 0) },
    { label: "Total revenue", value: formatMoney(summary.ingresosTotal), highlight: true },
  ];

  const gastos = [
    { label: "Fuel", value: formatMoney(summary.gastoGasolina) },
    { label: "Food", value: formatMoney(summary.gastoComida) },
    { label: "Lodging", value: formatMoney(summary.gastoHospedaje) },
    { label: "Tolls", value: formatMoney(summary.gastoPeajes) },
    { label: "Vehicle", value: formatMoney(summary.gastoVehiculo) },
    { label: "Other expenses", value: formatMoney(summary.otrosGastos) },
  ];

  const resultados = [
    { label: "Total expenses", value: formatMoney(summary.gastosTotal), color: "text-destructive" },
    { label: "Net profit", value: formatMoney(summary.gananciaNeta), color: summary.gananciaNeta >= 0 ? "text-success" : "text-destructive" },
    { label: "Average revenue/load", value: formatMoney(summary.ingresoPromedioPorCarga) },
    { label: "Profit/mile", value: formatMoney(summary.gananciaPorMilla) },
  ];

  return (
    <div className="pb-20">
      <PageHeader title="Weekly Breakdown" />

      <div className="flex items-center justify-between px-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm font-medium">{summary.weekLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o + 1)} disabled={weekOffset >= 0}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Activity</h3>
          {rows.map(r => (
            <div key={r.label} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={`font-medium ${r.highlight ? "text-primary" : ""}`}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Expenses</h3>
          {gastos.map(r => (
            <div key={r.label} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Results</h3>
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
