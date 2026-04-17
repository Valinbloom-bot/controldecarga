import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { RegistroGasolina } from "@/types";
import { formatMoney } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import ExportMenu from "@/components/ExportMenu";
import { exportGasolinaCSV, exportGasolinaPDF } from "@/lib/exports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Link2 } from "lucide-react";
import { format } from "date-fns";

const nowTime = () => format(new Date(), "HH:mm");

const buildEmptyForm = () => ({
  fecha: format(new Date(), "yyyy-MM-dd"),
  hora: nowTime(),
  gasolinera: "",
  ubicacion: "",
  galones: 0,
  precioPorGalon: 0,
  snackComida: 0,
  metodoPago: "Efectivo",
  notas: "",
  cargaId: "",
};

export default function ControlGasolina() {
  const { data, addGasolina, updateGasolina, deleteGasolina } = useAppData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RegistroGasolina | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpen = (g?: RegistroGasolina) => {
    if (g) {
      setEditing(g);
      setForm({ fecha: g.fecha, gasolinera: g.gasolinera, ubicacion: g.ubicacion, galones: g.galones, precioPorGalon: g.precioPorGalon, snackComida: g.snackComida, metodoPago: g.metodoPago, notas: g.notas, cargaId: g.cargaId || "" });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSave = () => {
    const payload = { ...form, cargaId: form.cargaId || undefined };
    if (editing) updateGasolina({ ...editing, ...payload });
    else addGasolina(payload);
    setOpen(false);
  };

  const setField = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const numField = (k: string, v: string) => setField(k, v === "" ? 0 : parseFloat(v) || 0);

  const totalGas = (form.galones || 0) * (form.precioPorGalon || 0);
  const totalGastado = totalGas + (form.snackComida || 0);

  const sorted = [...data.gasolina].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getCargaLabel = (cargaId?: string) => {
    if (!cargaId) return null;
    const c = data.cargas.find(x => x.id === cargaId);
    if (!c) return null;
    return `${c.ubicacionRecogida} → ${c.ubicacionEntrega} (${c.fechaRecogida})`;
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Control de Gasolina"
        action={
          <>
          <ExportMenu
            items={data.gasolina}
            getDate={(g) => g.fecha}
            onCSV={(f) => exportGasolinaCSV(f)}
            onPDF={(f) => exportGasolinaPDF(f)}
            emptyMessage="No hay registros de gasolina"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" /> Nueva</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} Gasolina</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setField("fecha", e.target.value)} /></div>
                <div><Label>Gasolinera</Label><Input value={form.gasolinera} onChange={e => setField("gasolinera", e.target.value)} placeholder="Nombre" /></div>
                <div><Label>Ubicación</Label><Input value={form.ubicacion} onChange={e => setField("ubicacion", e.target.value)} placeholder="Ciudad, Estado" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Galones</Label><Input type="number" step="0.01" value={form.galones || ""} onChange={e => numField("galones", e.target.value)} /></div>
                  <div><Label>Precio/Galón</Label><Input type="number" step="0.01" value={form.precioPorGalon || ""} onChange={e => numField("precioPorGalon", e.target.value)} /></div>
                </div>
                <div className="bg-muted p-2 rounded text-sm">Total gasolina: <strong>{formatMoney(totalGas)}</strong></div>
                <div><Label>Snack/Comida ($)</Label><Input type="number" value={form.snackComida || ""} onChange={e => numField("snackComida", e.target.value)} /></div>
                <div className="bg-muted p-2 rounded text-sm">Total gastado: <strong>{formatMoney(totalGastado)}</strong></div>
                <div><Label>Método de pago</Label>
                  <select className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm" value={form.metodoPago} onChange={e => setField("metodoPago", e.target.value)}>
                    <option>Efectivo</option><option>Tarjeta débito</option><option>Tarjeta crédito</option><option>EFS</option><option>Otro</option>
                  </select>
                </div>
                <div>
                  <Label>Vincular a carga (opcional)</Label>
                  <Select value={form.cargaId} onValueChange={v => setField("cargaId", v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin vincular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin vincular</SelectItem>
                      {data.cargas.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.ubicacionRecogida} → {c.ubicacionEntrega} ({c.fechaRecogida})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Notas</Label><Input value={form.notas} onChange={e => setField("notas", e.target.value)} /></div>
                <Button className="w-full" size="lg" onClick={handleSave}>{editing ? "Guardar" : "Registrar"}</Button>
              </div>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      {sorted.length === 0 ? (
        <div className="text-center text-muted-foreground py-16"><p>Sin registros de gasolina</p></div>
      ) : (
        <div className="px-4 space-y-2">
          {sorted.map(g => (
            <div key={g.id} className="bg-card border border-border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm">{g.gasolinera || "Gasolinera"}</div>
                  <div className="text-xs text-muted-foreground">{g.fecha} · {g.ubicacion}</div>
                  <div className="text-xs mt-1">{g.galones} gal × {formatMoney(g.precioPorGalon)}</div>
                  {g.cargaId && (
                    <div className="text-xs mt-1 flex items-center gap-1 text-primary">
                      <Link2 className="w-3 h-3" />
                      <span>{getCargaLabel(g.cargaId)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{formatMoney(g.totalGastado)}</div>
                  <div className="flex gap-1 mt-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(g)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteGasolina(g.id)}><Trash2 className="w-3 h-3" /></Button>
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
