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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Fuel, Moon } from "lucide-react";

const TIMEZONES = [
  { value: "ET", label: "ET - Eastern" },
  { value: "CT", label: "CT - Central" },
  { value: "MT", label: "MT - Mountain" },
  { value: "PT", label: "PT - Pacific" },
  { value: "AT", label: "AT - Alaska" },
  { value: "HT", label: "HT - Hawaii" },
] as const;

// Time stored as "HH:mm TZ" (e.g. "08:00 ET"); split for UI
function parseTime(v?: string): { time: string; tz: string } {
  if (!v) return { time: "", tz: "ET" };
  const [time, tz] = v.split(" ");
  return { time: time ?? "", tz: tz || "ET" };
}
function buildTime(time: string, tz: string): string {
  if (!time) return "";
  return `${time} ${tz || "ET"}`;
}
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUsageGate } from "@/hooks/useUsageGate";
import UsageBanner from "@/components/UsageBanner";

const emptyForm = {
  fechaRecogida: format(new Date(), "yyyy-MM-dd"),
  horaRecogida: format(new Date(), "HH:mm"),
  horaSalidaRecogida: "",
  ubicacionRecogida: "",
  fechaEntrega: format(new Date(), "yyyy-MM-dd"),
  horaEntrega: "",
  horaSalidaEntrega: "",
  ubicacionEntrega: "",
  millasVacias: 0,
  millasCargadas: 0,
  pagoRecibido: 0,
  costoGasolina: 0,
  peajes: 0,
  hospedaje: 0,
  notas: "",
};

export default function RegistroCarga() {
  const { data, addCarga, updateCarga, deleteCarga, addPeaje } = useAppData();
  const navigate = useNavigate();
  const { blocked } = useUsageGate("cargas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Carga | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [overnight, setOvernight] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpen = (carga?: Carga) => {
    if (!carga && blocked) {
      toast.info("Llegaste al límite gratis. Empieza tu prueba para registrar más.");
      navigate("/precios");
      return;
    }
    if (carga) {
      setEditing(carga);
      setForm({
        fechaRecogida: carga.fechaRecogida,
        horaRecogida: carga.horaRecogida,
        horaSalidaRecogida: carga.horaSalidaRecogida ?? "",
        ubicacionRecogida: carga.ubicacionRecogida,
        fechaEntrega: carga.fechaEntrega,
        horaEntrega: carga.horaEntrega,
        horaSalidaEntrega: carga.horaSalidaEntrega ?? "",
        ubicacionEntrega: carga.ubicacionEntrega,
        millasVacias: carga.millasVacias || 0,
        millasCargadas: carga.millasCargadas || 0,
        pagoRecibido: carga.pagoRecibido,
        costoGasolina: carga.costoGasolina,
        peajes: 0,
        hospedaje: carga.hospedaje,
        notas: carga.notas,
      });
      setOvernight(carga.hospedaje > 0);
      setExtrasOpen(carga.costoGasolina > 0);
    } else {
      setEditing(null);
      setForm(emptyForm);
      setOvernight(false);
      setExtrasOpen(false);
    }
    setOpen(true);
  };

  const millasTotalCalc = (form.millasVacias || 0) + (form.millasCargadas || 0);

  const handleSave = async () => {
    if (saving) return;
    if (!form.ubicacionRecogida.trim() || !form.ubicacionEntrega.trim()) {
      toast.error("Completa recogida y entrega");
      return;
    }
    if (!form.fechaRecogida || !form.horaRecogida) {
      toast.error("Ingresa fecha y hora de recogida");
      return;
    }
    if (!form.fechaEntrega || !form.horaEntrega) {
      toast.error("Ingresa fecha y hora de entrega");
      return;
    }
    if (millasTotalCalc <= 0) {
      toast.error("Ingresa millas (vacías o cargadas)");
      return;
    }
    if (!form.pagoRecibido || form.pagoRecibido <= 0) {
      toast.error("Ingresa el pago recibido");
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const payload = {
      fechaRecogida: form.fechaRecogida,
      horaRecogida: form.horaRecogida,
      horaSalidaRecogida: form.horaSalidaRecogida,
      ubicacionRecogida: form.ubicacionRecogida,
      fechaEntrega: form.fechaEntrega,
      horaEntrega: form.horaEntrega,
      horaSalidaEntrega: form.horaSalidaEntrega,
      ubicacionEntrega: form.ubicacionEntrega,
      millasVacias: form.millasVacias || 0,
      millasCargadas: form.millasCargadas || 0,
      pagoRecibido: form.pagoRecibido,
      costoGasolina: form.costoGasolina,
      gastosComida: 0,
      hospedaje: overnight ? form.hospedaje : 0,
      otrosGastos: 0,
      notas: form.notas,
    };

    setSaving(true);
    let ok = false;
    if (editing) {
      ok = await updateCarga({ ...editing, ...payload });
    } else {
      ok = await addCarga(payload);
      if (ok && form.peajes > 0) {
        await addPeaje({
          fecha: today,
          ubicacionCarretera: `${form.ubicacionRecogida} → ${form.ubicacionEntrega}`,
          monto: form.peajes,
          metodoPago: "",
          notas: "Auto-registrado desde carga",
        });
      }
    }
    setSaving(false);
    if (ok) {
      setOpen(false);
      setEditing(null);
    }
  };

  const setField = (key: string, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const numField = (key: string, value: string) => {
    setField(key, value === "" ? 0 : parseFloat(value) || 0);
  };

  const getLinkedGas = (cargaId: string) => data.gasolina.filter(g => g.cargaId === cargaId);

  const linkedGasForEdit = editing ? getLinkedGas(editing.id) : [];
  const linkedGasCost = linkedGasForEdit.reduce((s, g) => s + g.totalGasolina, 0);
  const effectiveGasCost = linkedGasCost > 0 ? linkedGasCost : (form.costoGasolina || 0);
  const totalGastos = effectiveGasCost + (form.peajes || 0) + (overnight ? (form.hospedaje || 0) : 0);
  const gananciaNeta = (form.pagoRecibido || 0) - totalGastos;
  const gananciaPorMilla = millasTotalCalc > 0 ? gananciaNeta / millasTotalCalc : 0;

  // Trip duration in hours
  const duracionHoras = (() => {
    if (!form.fechaRecogida || !form.horaRecogida || !form.fechaEntrega || !form.horaEntrega) return 0;
    const start = new Date(`${form.fechaRecogida}T${form.horaRecogida}`);
    const end = new Date(`${form.fechaEntrega}T${form.horaEntrega}`);
    const diff = (end.getTime() - start.getTime()) / 3600000;
    return diff > 0 ? diff : 0;
  })();
  const formatDuracion = (h: number) => {
    if (h <= 0) return "—";
    const horas = Math.floor(h);
    const mins = Math.round((h - horas) * 60);
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
  };
  const gananciaPorHora = duracionHoras > 0 ? gananciaNeta / duracionHoras : 0;

  const sorted = [...data.cargas].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="pb-20">
      <PageHeader
        title="Registro de Carga"
        action={
          <>
          <ExportMenu
            items={data.cargas}
            getDate={(c) => c.fechaRecogida}
            onCSV={(f) => exportCargasCSV(f)}
            onPDF={(f) => exportCargasPDF(f)}
            emptyMessage="No hay cargas"
          />
          <Dialog open={open} onOpenChange={(v) => { if (!saving) setOpen(v); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}>
                <Plus className="w-4 h-4 mr-1" /> Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto max-w-md" onInteractOutside={(e) => { if (saving) e.preventDefault(); }} onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }}>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Carga" : "Nueva Carga"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Required fields - big and tappable */}
                <div className="space-y-1.5">
                  <Label className="text-base">Recogida *</Label>
                  <Input
                    className="h-12 text-base"
                    value={form.ubicacionRecogida}
                    onChange={e => setField("ubicacionRecogida", e.target.value)}
                    placeholder="Ciudad, Estado"
                    autoFocus
                  />
                  <div className="pt-1">
                    <Input
                      className="h-12 text-base"
                      type="date"
                      value={form.fechaRecogida}
                      onChange={e => setField("fechaRecogida", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Check-in</Label>
                      <Input
                        className="h-12 text-base"
                        type="time"
                        value={form.horaRecogida}
                        onChange={e => setField("horaRecogida", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Check-out</Label>
                      <Input
                        className="h-12 text-base"
                        type="time"
                        value={form.horaSalidaRecogida}
                        onChange={e => setField("horaSalidaRecogida", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-base">Entrega *</Label>
                  <Input
                    className="h-12 text-base"
                    value={form.ubicacionEntrega}
                    onChange={e => setField("ubicacionEntrega", e.target.value)}
                    placeholder="Ciudad, Estado"
                  />
                  <div className="pt-1">
                    <Input
                      className="h-12 text-base"
                      type="date"
                      value={form.fechaEntrega}
                      onChange={e => setField("fechaEntrega", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Check-in</Label>
                      <Input
                        className="h-12 text-base"
                        type="time"
                        value={form.horaEntrega}
                        onChange={e => setField("horaEntrega", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Check-out</Label>
                      <Input
                        className="h-12 text-base"
                        type="time"
                        value={form.horaSalidaEntrega}
                        onChange={e => setField("horaSalidaEntrega", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Mileage - three fields with auto-total */}
                <div className="space-y-2">
                  <Label className="text-base">Millas *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Vacías (DH)</Label>
                      <Input
                        className="h-12 text-base"
                        type="number"
                        inputMode="numeric"
                        value={form.millasVacias || ""}
                        onChange={e => numField("millasVacias", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Cargadas</Label>
                      <Input
                        className="h-12 text-base"
                        type="number"
                        inputMode="numeric"
                        value={form.millasCargadas || ""}
                        onChange={e => numField("millasCargadas", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Totales (auto)</Label>
                    <Input
                      className="h-12 text-base bg-muted"
                      type="number"
                      value={millasTotalCalc || ""}
                      readOnly
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-base">Pago $ *</Label>
                  <Input
                    className="h-12 text-base"
                    type="number"
                    inputMode="decimal"
                    value={form.pagoRecibido || ""}
                    onChange={e => numField("pagoRecibido", e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Overnight toggle */}
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="overnight" className="text-base cursor-pointer">Viaje con pernocta</Label>
                  </div>
                  <Switch id="overnight" checked={overnight} onCheckedChange={setOvernight} />
                </div>

                {overnight && (
                  <div className="space-y-1.5 animate-slide-up">
                    <Label className="text-base">Hospedaje $</Label>
                    <Input
                      className="h-12 text-base"
                      type="number"
                      inputMode="decimal"
                      value={form.hospedaje || ""}
                      onChange={e => numField("hospedaje", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                )}

                {/* Optional collapsible extras */}
                <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium"
                    >
                      <span>Gastos adicionales (opcional)</span>
                      {extrasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    {linkedGasForEdit.length > 0 ? (
                      <div className="bg-primary/10 border border-primary/20 p-3 rounded space-y-1">
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Fuel className="w-4 h-4" /> Gasolina vinculada: {formatMoney(linkedGasCost)}
                        </div>
                        <p className="text-xs text-muted-foreground">Desde Control de Gasolina.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Label>Gasolina $</Label>
                        <Input type="number" inputMode="decimal" value={form.costoGasolina || ""} onChange={e => numField("costoGasolina", e.target.value)} placeholder="0" />
                      </div>
                    )}
                    {!editing && (
                      <div className="space-y-1.5">
                        <Label>Peajes $</Label>
                        <Input type="number" inputMode="decimal" value={form.peajes || ""} onChange={e => numField("peajes", e.target.value)} placeholder="0" />
                        <p className="text-xs text-muted-foreground">Se registrará en Control de Peajes.</p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Real-time totals */}
                <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total gastos:</span>
                    <strong className="text-destructive">{formatMoney(totalGastos)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ganancia neta:</span>
                    <strong className={gananciaNeta >= 0 ? "text-success" : "text-destructive"}>{formatMoney(gananciaNeta)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ganancia/milla:</span>
                    <strong>{formatMoney(gananciaPorMilla)}</strong>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 mt-1">
                    <span className="text-muted-foreground">Duración del viaje:</span>
                    <strong>{formatDuracion(duracionHoras)}</strong>
                  </div>
                  {duracionHoras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ganancia/hora:</span>
                      <strong>{formatMoney(gananciaPorHora)}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Notas</Label>
                  <Textarea value={form.notas} onChange={e => setField("notas", e.target.value)} placeholder="Notas opcionales" rows={2} />
                </div>

                <Button className="w-full h-12 text-base" size="lg" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : (editing ? "Guardar Cambios" : "Registrar Carga")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </>
        }
      />
      <UsageBanner resource="cargas" />

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
