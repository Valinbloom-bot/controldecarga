import { useState, useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { GastoVehiculo, CATEGORIAS_GASTO_VEHICULO } from "@/types";
import { formatMoney, filterByMonth } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUsageGate } from "@/hooks/useUsageGate";
import UsageBanner from "@/components/UsageBanner";

const buildEmptyForm = () => ({
  fecha: format(new Date(), "yyyy-MM-dd"),
  categoria: "Mantenimiento",
  descripcion: "",
  monto: 0,
  notas: "",
});

export default function GastosVehiculo() {
  const { data, addGastoVehiculo, updateGastoVehiculo, deleteGastoVehiculo } = useAppData();
  const navigate = useNavigate();
  const { blocked } = useUsageGate("gastosVehiculo");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GastoVehiculo | null>(null);
  const [form, setForm] = useState(buildEmptyForm);
  const [saving, setSaving] = useState(false);

  const handleOpen = (g?: GastoVehiculo) => {
    if (!g && blocked) {
      toast.info("Llegaste al límite gratis. Empieza tu prueba para registrar más.");
      navigate("/precios");
      return;
    }
    if (g) {
      setEditing(g);
      setForm({
        fecha: g.fecha,
        categoria: g.categoria || "Mantenimiento",
        descripcion: g.descripcion,
        monto: g.monto,
        notas: g.notas,
      });
    } else {
      setEditing(null);
      setForm(buildEmptyForm());
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.descripcion.trim()) {
      toast.error("Ingresa una descripción");
      return;
    }
    if (!form.monto || form.monto <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    setSaving(true);
    const ok = editing ? await updateGastoVehiculo({ ...editing, ...form }) : await addGastoVehiculo(form);
    setSaving(false);
    if (ok) setOpen(false);
  };

  const setField = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const numField = (k: string, v: string) => setField(k, v === "" ? 0 : parseFloat(v) || 0);

  const sorted = useMemo(
    () => [...data.gastosVehiculo].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.gastosVehiculo]
  );

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthTotal = useMemo(
    () => filterByMonth(data.gastosVehiculo, currentMonth).reduce((s, g) => s + g.monto, 0),
    [data.gastosVehiculo, currentMonth]
  );

  return (
    <div className="pb-20">
      <PageHeader
        title="Gastos del Vehículo"
        action={
          <Dialog open={open} onOpenChange={(v) => { if (!saving) setOpen(v); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}>
                <Plus className="w-4 h-4 mr-1" /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md" onInteractOutside={(e) => { if (saving) e.preventDefault(); }} onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }}>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar" : "Nuevo"} Gasto del Vehículo</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" value={form.fecha} onChange={e => setField("fecha", e.target.value)} />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={form.categoria} onValueChange={v => setField("categoria", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_GASTO_VEHICULO.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={form.descripcion}
                    onChange={e => setField("descripcion", e.target.value)}
                    placeholder="Ej: Cambio de aceite y filtro"
                  />
                </div>
                <div>
                  <Label>Monto $</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={form.monto || ""}
                    onChange={e => numField("monto", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Notas (opcional)</Label>
                  <Textarea value={form.notas} onChange={e => setField("notas", e.target.value)} rows={2} />
                </div>
                <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : (editing ? "Guardar" : "Registrar")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <UsageBanner resource="gastosVehiculo" />

      <div className="px-4 mb-3">
        <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total este mes</span>
          </div>
          <strong className="text-lg text-destructive">{formatMoney(monthTotal)}</strong>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 px-4">
          <p className="text-lg mb-2">Sin gastos del vehículo</p>
          <p className="text-sm">Toca "Nuevo" para registrar el primero</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {sorted.map(g => (
            <div key={g.id} className="bg-card border border-border rounded-lg p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wide bg-muted px-1.5 py-0.5 rounded">{g.categoria}</span>
                    <span className="text-xs text-muted-foreground">{g.fecha}</span>
                  </div>
                  <div className="font-semibold text-sm mt-1 truncate">{g.descripcion}</div>
                  {g.notas && <div className="text-xs text-muted-foreground mt-0.5 truncate">{g.notas}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-destructive">{formatMoney(g.monto)}</div>
                  <div className="flex gap-1 mt-1 justify-end">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(g)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteGastoVehiculo(g.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
