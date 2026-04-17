import { useAppData } from "@/context/AppContext";
import { computeWeeklySummary, computeMonthlySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp, TrendingDown, MapPin, Fuel, CreditCard, Truck, BarChart3 } from "lucide-react";
import { format, startOfWeek, addWeeks } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { data } = useAppData();
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const monthly = computeMonthlySummary(data.cargas, data.gasolina, data.peajes, currentMonth, data.gastosVehiculo);

  // Last 4 weeks chart data
  const weeklyChart = Array.from({ length: 4 }, (_, i) => {
    const weekDate = addWeeks(now, -3 + i);
    const summary = computeWeeklySummary(data.cargas, data.gasolina, data.peajes, weekDate, data.gastosVehiculo);
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
    return {
      name: format(weekStart, "dd/MM"),
      ingresos: Math.round(summary.ingresosTotal),
      gastos: Math.round(summary.gastosTotal),
      ganancia: Math.round(summary.gananciaNeta),
    };
  });

  const quickActions = [
    { label: "Nueva Carga", icon: Truck, to: "/cargas" },
    { label: "Gasolina", icon: Fuel, to: "/gasolina" },
    { label: "Peaje", icon: CreditCard, to: "/peajes" },
    { label: "Resumen", icon: BarChart3, to: "/resumen" },
  ];

  return (
    <div className="pb-20">
      <PageHeader title="Panel Principal" />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-4">
        {quickActions.map(({ label, icon: Icon, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-transform"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-4">
        <StatCard label="Ingresos" value={formatMoney(monthly.ingresosTotal)} icon={<DollarSign className="w-4 h-4" />} />
        <StatCard label="Gastos" value={formatMoney(monthly.gastosTotal)} icon={<TrendingDown className="w-4 h-4" />} variant="destructive" />
        <StatCard label="Ganancia Neta" value={formatMoney(monthly.gananciaNeta)} icon={<TrendingUp className="w-4 h-4" />} variant="success" />
        <StatCard label="Millas" value={formatNumber(monthly.millasTotal, 0)} icon={<MapPin className="w-4 h-4" />} />
        <StatCard label="Gasolina" value={formatMoney(monthly.gastoGasolina)} icon={<Fuel className="w-4 h-4" />} variant="accent" />
        <StatCard label="Peajes" value={formatMoney(monthly.gastoPeajes)} icon={<CreditCard className="w-4 h-4" />} />
        <StatCard label="Prom/Carga" value={formatMoney(monthly.ingresoPromedioPorCarga)} icon={<Truck className="w-4 h-4" />} />
        <StatCard label="$/Milla" value={formatMoney(monthly.gananciaPorMilla)} icon={<BarChart3 className="w-4 h-4" />} variant="success" />
      </div>

      {/* Chart */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-3">Ingresos vs Gastos (últimas 4 semanas)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyChart}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="ingresos" fill="hsl(var(--chart-income))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="hsl(var(--chart-expense))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="px-4">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-3">Ganancia Neta Semanal</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyChart}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="ganancia" fill="hsl(var(--chart-profit))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
