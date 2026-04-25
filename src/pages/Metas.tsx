import { useState, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { computeMonthlySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DesgloseMes() {
  const { data } = useAppData();
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = addMonths(new Date(), monthOffset);
  const yearMonth = format(monthDate, "yyyy-MM");
  const monthLabel = format(monthDate, "MMMM yyyy");
  const summary = computeMonthlySummary(data.cargas, data.gasolina, data.peajes, yearMonth, data.gastosVehiculo);

  const chartData = useMemo(() => [
    { name: "Revenue", value: summary.ingresosTotal },
    { name: "Expenses", value: summary.gastosTotal },
    { name: "Profit", value: Math.max(summary.gananciaNeta, 0) },
  ], [summary]);

  return (
    <div className="pb-20">
      <PageHeader title="Monthly Breakdown" />

      <div className="flex items-center justify-between px-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setMonthOffset(o => o - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Visual Summary</h3>
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
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Activity</h3>
          {[
            ["Total loads", summary.totalCargas],
            ["Miles driven", formatNumber(summary.millasTotal, 0)],
            ["Days worked", summary.diasTrabajados],
            ["Total revenue", formatMoney(summary.ingresosTotal)],
            ["Average/load", formatMoney(summary.ingresoPromedioPorCarga)],
          ].map(([l, v]) => (
            <div key={l as string} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Expenses</h3>
          {[
            ["Fuel", summary.gastoGasolina],
            ["Food", summary.gastoComida],
            ["Lodging", summary.gastoHospedaje],
            ["Tolls", summary.gastoPeajes],
            ["Other", summary.otrosGastos],
            ["Total expenses", summary.gastosTotal],
          ].map(([l, v], i, arr) => (
            <div key={l as string} className={`flex justify-between py-1 text-sm ${i === arr.length - 1 ? "border-t border-border pt-2 mt-1" : ""}`}>
              <span className="text-muted-foreground">{l}</span>
              <span className={`font-medium ${i === arr.length - 1 ? "font-bold text-destructive" : ""}`}>{formatMoney(v as number)}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Results</h3>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Net profit</span>
            <span className={`font-bold text-lg ${summary.gananciaNeta >= 0 ? "text-success" : "text-destructive"}`}>
              {formatMoney(summary.gananciaNeta)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Profit per mile</span>
            <span className="font-medium">{formatMoney(summary.gananciaPorMilla)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
