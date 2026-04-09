import { useState, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { computeMonthlySummary, formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trophy, AlertTriangle } from "lucide-react";

export default function Metas() {
  const { data, setMeta } = useAppData();
  const currentMonth = format(new Date(), "yyyy-MM");
  const monthLabel = format(new Date(), "MMMM yyyy", { locale: es });
  const summary = computeMonthlySummary(data.cargas, data.gasolina, data.peajes, currentMonth);
  const existing = data.metas.find(m => m.mes === currentMonth);

  const [form, setForm] = useState({
    metaCargas: existing?.metaCargas || 0,
    metaIngreso: existing?.metaIngreso || 0,
    metaMillas: existing?.metaMillas || 0,
    metaGananciaNeta: existing?.metaGananciaNeta || 0,
  });

  const handleSave = () => {
    setMeta({ ...form, mes: currentMonth });
  };

  const goals = useMemo(() => [
    { label: "Cargas", current: summary.totalCargas, target: form.metaCargas, format: (n: number) => n.toString() },
    { label: "Ingresos", current: summary.ingresosTotal, target: form.metaIngreso, format: formatMoney },
    { label: "Millas", current: summary.millasTotal, target: form.metaMillas, format: (n: number) => formatNumber(n, 0) },
    { label: "Ganancia Neta", current: summary.gananciaNeta, target: form.metaGananciaNeta, format: formatMoney },
  ], [summary, form]);

  return (
    <div className="pb-20">
      <PageHeader title="Metas del Mes" />
      <p className="px-4 text-sm text-muted-foreground mb-4 capitalize">{monthLabel}</p>

      <div className="px-4 space-y-3 mb-6">
        {goals.map(g => {
          const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0;
          const behind = g.target > 0 && pct < 50;
          const complete = pct >= 100;
          return (
            <div key={g.label} className="bg-card border border-border rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{g.label}</span>
                <div className="flex items-center gap-1">
                  {complete && <Trophy className="w-4 h-4 text-accent" />}
                  {behind && <AlertTriangle className="w-4 h-4 text-accent" />}
                  <span className="text-xs text-muted-foreground">{g.format(g.current)} / {g.format(g.target)}</span>
                </div>
              </div>
              <Progress value={pct} className="h-2" />
              {complete && <p className="text-xs text-success mt-1 font-medium">¡Meta alcanzada! 🎉</p>}
              {behind && <p className="text-xs text-accent mt-1">Vas por debajo del objetivo</p>}
            </div>
          );
        })}
      </div>

      <div className="px-4">
        <div className="bg-card border border-border rounded-lg p-3 space-y-3">
          <h3 className="text-sm font-semibold">Configurar Metas</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Meta cargas</Label><Input type="number" value={form.metaCargas || ""} onChange={e => setForm(f => ({ ...f, metaCargas: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label>Meta ingreso ($)</Label><Input type="number" value={form.metaIngreso || ""} onChange={e => setForm(f => ({ ...f, metaIngreso: parseFloat(e.target.value) || 0 }))} /></div>
            <div><Label>Meta millas</Label><Input type="number" value={form.metaMillas || ""} onChange={e => setForm(f => ({ ...f, metaMillas: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label>Meta ganancia ($)</Label><Input type="number" value={form.metaGananciaNeta || ""} onChange={e => setForm(f => ({ ...f, metaGananciaNeta: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <Button className="w-full" onClick={handleSave}>Guardar Metas</Button>
        </div>
      </div>
    </div>
  );
}
