import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { RegistroPeaje } from "@/types";
import { formatMoney } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import ExportMenu from "@/components/ExportMenu";
import { exportPeajesCSV, exportPeajesPDF } from "@/lib/exports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const emptyForm = {
  fecha: format(new Date(), "yyyy-MM-dd"),
  ubicacionCarretera: "",
  monto: 0,
  metodoPago: "E-ZPass",
  notas: "",
};

export default function ControlPeajes() {
  const { data, addPeaje, updatePeaje, deletePeaje } = useAppData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RegistroPeaje | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpen = (p?: RegistroPeaje) => {
    if (p) { setEditing(p); setForm({ fecha: p.fecha, ubicacionCarretera: p.ubicacionCarretera, monto: p.monto, metodoPago: p.metodoPago, notas: p.notas }); }
    else { setEditing(null); setForm(emptyForm); }
    setOpen(true);
  };

  const handleSave = () => {
    if (editing) updatePeaje({ ...editing, ...form });
    else addPeaje(form);
    setOpen(false);
  };

  const sorted = [...data.peajes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const monthTotal = data.peajes.filter(p => p.fecha.startsWith(format(new Date(), "yyyy-MM"))).reduce((s, p) => s + p.monto, 0);

  return (
    <div className="pb-20">
      <PageHeader
        title="Control de Peajes"
        action={
          <>
          <ExportMenu
            items={data.peajes}
            getDate={(p) => p.fecha}
            onCSV={(f) => exportPeajesCSV(f)}
            onPDF={(f) => exportPeajesPDF(f)}
            emptyMessage="No hay peajes"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" /> Nuevo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} Peaje</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></div>
                <div><Label>Ubicación / Carretera</Label><Input value={form.ubicacionCarretera} onChange={e => setForm(f => ({ ...f, ubicacionCarretera: e.target.value }))} placeholder="I-95, NJ Turnpike..." /></div>
                <div><Label>Monto ($)</Label><Input type="number" step="0.01" value={form.monto || ""} onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} /></div>
                <div><Label>Método de pago</Label>
                  <select className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm" value={form.metodoPago} onChange={e => setForm(f => ({ ...f, metodoPago: e.target.value }))}>
                    <option>E-ZPass</option><option>Efectivo</option><option>Tarjeta</option><option>Otro</option>
                  </select>
                </div>
                <div><Label>Notas</Label><Input value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></div>
                <Button className="w-full" size="lg" onClick={handleSave}>{editing ? "Guardar" : "Registrar"}</Button>
              </div>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      <div className="px-4 mb-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
          <span className="text-sm text-muted-foreground">Total peajes este mes</span>
          <p className="text-2xl font-bold font-display text-primary">{formatMoney(monthTotal)}</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center text-muted-foreground py-16"><p>Sin peajes registrados</p></div>
      ) : (
        <div className="px-4 space-y-2">
          {sorted.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">{p.ubicacionCarretera || "Peaje"}</div>
                <div className="text-xs text-muted-foreground">{p.fecha} · {p.metodoPago}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{formatMoney(p.monto)}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(p)}><Pencil className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deletePeaje(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
