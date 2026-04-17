import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { Carga } from "@/types";
import { formatMoney, formatNumber } from "@/lib/calculations";
import PageHeader from "@/components/PageHeader";
import ExportMenu from "@/components/ExportMenu";
import { exportCargasCSV, exportCargasPDF } from "@/lib/exports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Fuel } from "lucide-react";
import { format } from "date-fns";

const emptyForm = {
  fechaRecogida: format(new Date(), "yyyy-MM-dd"),
  horaRecogida: format(new Date(), "HH:mm"),
  ubicacionRecogida: "",
  fechaEntrega: format(new Date(), "yyyy-MM-dd"),
  horaEntrega: "",
  ubicacionEntrega: "",
  millasVacias: 0,
  millasCargadas: 0,
  pagoRecibido: 0,
  costoGasolina: 0,
  gastosComida: 0,
  hospedaje: 0,
  otrosGastos: 0,
  notas: "",
};

export default function RegistroCarga() {
  const { data, addCarga, updateCarga, deleteCarga } = useAppData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Carga | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleOpen = (carga?: Carga) => {
    if (carga) {
      setEditing(carga);
      setForm({
        fechaRecogida: carga.fechaRecogida,
        horaRecogida: carga.horaRecogida,
        ubicacionRecogida: carga.ubicacionRecogida,
        fechaEntrega: carga.fechaEntrega,
        horaEntrega: carga.horaEntrega,
        ubicacionEntrega: carga.ubicacionEntrega,
        millasVacias: carga.millasVacias,
        millasCargadas: carga.millasCargadas,
        pagoRecibido: carga.pagoRecibido,
        costoGasolina: carga.costoGasolina,
        gastosComida: carga.gastosComida,
        hospedaje: carga.hospedaje,
        otrosGastos: carga.otrosGastos,
        notas: carga.notas,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      updateCarga({ ...editing, ...form });
    } else {
      addCarga(form);
    }
    setOpen(false);
    setEditing(null);
  };

  const setField = (key: string, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const numField = (key: string, value: string) => {
    setField(key, value === "" ? 0 : parseFloat(value) || 0);
  };

  // Get linked gas entries for a load
  const getLinkedGas = (cargaId: string) => data.gasolina.filter(g => g.cargaId === cargaId);

  const millasTotal = (form.millasVacias || 0) + (form.millasCargadas || 0);
  
  // For the form preview, check if editing a load with linked gas
  const linkedGasForEdit = editing ? getLinkedGas(editing.id) : [];
  const linkedGasCost = linkedGasForEdit.reduce((s, g) => s + g.totalGasolina, 0);
  const effectiveGasCost = linkedGasCost > 0 ? linkedGasCost : (form.costoGasolina || 0);
  const totalGastos = effectiveGasCost + (form.gastosComida || 0) + (form.hospedaje || 0) + (form.otrosGastos || 0);
  const gananciaNeta = (form.pagoRecibido || 0) - totalGastos;
  const gananciaPorMilla = millasTotal > 0 ? gananciaNeta / millasTotal : 0;

  const sorted = [...data.cargas].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="pb-20">
      <PageHeader
        title="Registro de Carga"
        action={
          <>
          <ExportMenu
            onCSV={() => exportCargasCSV(data.cargas)}
            onPDF={() => exportCargasPDF(data.cargas)}
            disabled={data.cargas.length === 0}
            emptyMessage="No hay cargas"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}>
                <Plus className="w-4 h-4 mr-1" /> Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Carga" : "Nueva Carga"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Fecha recogida</Label><Input type="date" value={form.fechaRecogida} onChange={e => setField("fechaRecogida", e.target.value)} /></div>
                  <div><Label>Hora</Label><Input type="time" value={form.horaRecogida} onChange={e => setField("horaRecogida", e.target.value)} /></div>
                </div>
                <div><Label>Ubicación recogida</Label><Input value={form.ubicacionRecogida} onChange={e => setField("ubicacionRecogida", e.target.value)} placeholder="Ciudad, Estado" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Fecha entrega</Label><Input type="date" value={form.fechaEntrega} onChange={e => setField("fechaEntrega", e.target.value)} /></div>
                  <div><Label>Hora</Label><Input type="time" value={form.horaEntrega} onChange={e => setField("horaEntrega", e.target.value)} /></div>
                </div>
                <div><Label>Ubicación entrega</Label><Input value={form.ubicacionEntrega} onChange={e => setField("ubicacionEntrega", e.target.value)} placeholder="Ciudad, Estado" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Millas vacías</Label><Input type="number" value={form.millasVacias || ""} onChange={e => numField("millasVacias", e.target.value)} /></div>
                  <div><Label>Millas cargadas</Label><Input type="number" value={form.millasCargadas || ""} onChange={e => numField("millasCargadas", e.target.value)} /></div>
                </div>
                <div className="bg-muted p-2 rounded text-sm">Millas totales: <strong>{formatNumber(millasTotal, 0)}</strong></div>
                <div><Label>Pago recibido ($)</Label><Input type="number" value={form.pagoRecibido || ""} onChange={e => numField("pagoRecibido", e.target.value)} /></div>
                
                {linkedGasForEdit.length > 0 ? (
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded space-y-1">
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      <Fuel className="w-4 h-4" /> Gasolina vinculada: {formatMoney(linkedGasCost)}
                    </div>
                    <p className="text-xs text-muted-foreground">Se usa el costo de las entradas vinculadas desde Control de Gasolina.</p>
                  </div>
                ) : (
                  <div><Label>Gasolina ($) <span className="text-muted-foreground font-normal">(manual)</span></Label><Input type="number" value={form.costoGasolina || ""} onChange={e => numField("costoGasolina", e.target.value)} /></div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Comida ($)</Label><Input type="number" value={form.gastosComida || ""} onChange={e => numField("gastosComida", e.target.value)} /></div>
                  <div><Label>Hospedaje ($)</Label><Input type="number" value={form.hospedaje || ""} onChange={e => numField("hospedaje", e.target.value)} /></div>
                </div>
                <div><Label>Otros gastos ($)</Label><Input type="number" value={form.otrosGastos || ""} onChange={e => numField("otrosGastos", e.target.value)} /></div>
                <div className="bg-muted p-3 rounded space-y-1 text-sm">
                  <div>Total gastos: <strong className="text-destructive">{formatMoney(totalGastos)}</strong></div>
                  <div>Ganancia neta: <strong className={gananciaNeta >= 0 ? "text-success" : "text-destructive"}>{formatMoney(gananciaNeta)}</strong></div>
                  <div>Ganancia/milla: <strong>{formatMoney(gananciaPorMilla)}</strong></div>
                </div>
                <div><Label>Notas</Label><Input value={form.notas} onChange={e => setField("notas", e.target.value)} placeholder="Notas opcionales" /></div>
                <Button className="w-full" size="lg" onClick={handleSave}>
                  {editing ? "Guardar Cambios" : "Registrar Carga"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {sorted.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 px-4">
          <p className="text-lg mb-2">Sin cargas registradas</p>
          <p className="text-sm">Toca "Nueva" para agregar tu primera carga</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {sorted.map(c => {
            const linkedGas = getLinkedGas(c.id);
            const linkedTotal = linkedGas.reduce((s, g) => s + g.totalGasolina, 0);
            return (
              <div key={c.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full p-3 flex items-center justify-between text-left"
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  <div>
                    <div className="text-sm font-semibold">{c.ubicacionRecogida} → {c.ubicacionEntrega}</div>
                    <div className="text-xs text-muted-foreground">{c.fechaRecogida}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${c.gananciaNeta >= 0 ? "text-success" : "text-destructive"}`}>
                      {formatMoney(c.gananciaNeta)}
                    </span>
                    {expanded === c.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expanded === c.id && (
                  <div className="px-3 pb-3 border-t border-border pt-2 text-sm space-y-2 animate-slide-up">
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-muted-foreground">Pago:</span><span className="font-medium">{formatMoney(c.pagoRecibido)}</span>
                      <span className="text-muted-foreground">Millas:</span><span>{formatNumber(c.millasTotal, 0)}</span>
                      <span className="text-muted-foreground">Gastos:</span><span className="text-destructive">{formatMoney(c.totalGastos)}</span>
                      <span className="text-muted-foreground">$/Milla:</span><span>{formatMoney(c.gananciaPorMilla)}</span>
                    </div>
                    
                    {linkedGas.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded p-2 space-y-1">
                        <div className="flex items-center gap-1 font-medium text-primary text-xs">
                          <Fuel className="w-3 h-3" /> Gasolina asociada ({formatMoney(linkedTotal)})
                        </div>
                        {linkedGas.map(g => (
                          <div key={g.id} className="text-xs text-muted-foreground pl-4">
                            {g.fecha} · {g.gasolinera || "Gasolinera"} · {g.galones} gal · {formatMoney(g.totalGasolina)}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {c.notas && <p className="text-muted-foreground italic">{c.notas}</p>}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(c)}><Pencil className="w-3 h-3 mr-1" /> Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCarga(c.id)}><Trash2 className="w-3 h-3 mr-1" /> Eliminar</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
