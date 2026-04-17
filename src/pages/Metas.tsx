import { useState, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { computeMonthlySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DesgloseMes() {
  const { data } = useAppData();
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = addMonths(new Date(), monthOffset);
  const yearMonth = format(monthDate, "yyyy-MM");
  const monthLabel = format(monthDate, "MMMM yyyy", { locale: es });
  const summary = computeMonthlySummary(data.cargas, data.gasolina, data.peajes, yearMonth, data.gastosVehiculo);

  const chartData = useMemo(() => [
    { name: "Ingresos", value: summary.ingresosTotal },
    { name: "Gastos", value: summary.gastosTotal },
    { name: "Ganancia", value: Math.max(summary.gananciaNeta, 0) },
  ], [summary]);

  return (
    <div className="pb-20">
      <PageHeader title="Desglose del Mes" />

      <div className="flex items-center justify-between px-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setMonthOffset(o => o - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Chart */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Resumen Visual</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={50} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(var(--destructive))" />
                <Cell fill="hsl(var(--success, 142 71% 45%))" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Actividad */}
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Actividad</h3>
          {[
            ["Total de cargas", summary.totalCargas],
            ["Millas recorridas", formatNumber(summary.millasTotal, 0)],
            ["Días trabajados", summary.diasTrabajados],
            ["Ingresos totales", formatMoney(summary.ingresosTotal)],
            ["Promedio/carga", formatMoney(summary.ingresoPromedioPorCarga)],
          ].map(([l, v]) => (
            <div key={l as string} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>

        {/* Gastos */}
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Gastos</h3>
          {[
            ["Gasolina", summary.gastoGasolina],
            ["Comida", summary.gastoComida],
            ["Hospedaje", summary.gastoHospedaje],
            ["Peajes", summary.gastoPeajes],
            ["Otros", summary.otrosGastos],
            ["Gastos totales", summary.gastosTotal],
          ].map(([l, v], i, arr) => (
            <div key={l as string} className={`flex justify-between py-1 text-sm ${i === arr.length - 1 ? "border-t border-border pt-2 mt-1" : ""}`}>
              <span className="text-muted-foreground">{l}</span>
              <span className={`font-medium ${i === arr.length - 1 ? "font-bold text-destructive" : ""}`}>{formatMoney(v as number)}</span>
            </div>
          ))}
        </div>

        {/* Resultados */}
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Resultados</h3>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Ganancia neta</span>
            <span className={`font-bold text-lg ${summary.gananciaNeta >= 0 ? "text-success" : "text-destructive"}`}>
              {formatMoney(summary.gananciaNeta)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Ganancia por milla</span>
            <span className="font-medium">{formatMoney(summary.gananciaPorMilla)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
