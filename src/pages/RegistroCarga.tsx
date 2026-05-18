import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import { Carga, Parada } from "@/types";
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
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Fuel, Moon, ArrowUp, ArrowDown, MapPin, PackageCheck } from "lucide-react";

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

const emptyExtras = {
  millasVacias: 0,
  millasCargadas: 0,
  pagoRecibido: 0,
  costoGasolina: 0,
  peajes: 0,
  hospedaje: 0,
  notas: "",
};

function newParada(tipo: "recogida" | "entrega"): Parada {
  return {
    tipo,
    fecha: format(new Date(), "yyyy-MM-dd"),
    hora: tipo === "recogida" ? `${format(new Date(), "HH:mm")} ET` : "",
    horaSalida: "",
    ubicacion: "",
    notas: "",
  };
}

// Build the editable parada arrays from a Carga (uses paradas if present, else flat fields)
function paradasFromCarga(c: Carga): { recogidas: Parada[]; entregas: Parada[] } {
  if (c.paradas && c.paradas.length > 0) {
    return {
      recogidas: c.paradas.filter(p => p.tipo === "recogida"),
      entregas: c.paradas.filter(p => p.tipo === "entrega"),
    };
  }
  return {
    recogidas: [{
      tipo: "recogida",
      fecha: c.fechaRecogida,
      hora: c.horaRecogida,
      horaSalida: c.horaSalidaRecogida ?? "",
      ubicacion: c.ubicacionRecogida,
      notas: "",
    }],
    entregas: [{
      tipo: "entrega",
      fecha: c.fechaEntrega,
      hora: c.horaEntrega,
      horaSalida: c.horaSalidaEntrega ?? "",
      ubicacion: c.ubicacionEntrega,
      notas: "",
    }],
  };
}

export default function RegistroCarga() {
  const { data, addCarga, updateCarga, deleteCarga, addPeaje } = useAppData();
  const navigate = useNavigate();
  const { blocked } = useUsageGate("cargas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Carga | null>(null);
  const [recogidas, setRecogidas] = useState<Parada[]>([newParada("recogida")]);
  const [entregas, setEntregas] = useState<Parada[]>([newParada("entrega")]);
  const [form, setForm] = useState(emptyExtras);
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
      const { recogidas: r, entregas: e } = paradasFromCarga(carga);
      setRecogidas(r.length > 0 ? r : [newParada("recogida")]);
      setEntregas(e.length > 0 ? e : [newParada("entrega")]);
      setForm({
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
      setRecogidas([newParada("recogida")]);
      setEntregas([newParada("entrega")]);
      setForm(emptyExtras);
      setOvernight(false);
      setExtrasOpen(false);
    }
    setOpen(true);
  };

  const millasTotalCalc = (form.millasVacias || 0) + (form.millasCargadas || 0);

  const updateParada = (tipo: "recogida" | "entrega", idx: number, patch: Partial<Parada>) => {
    const setter = tipo === "recogida" ? setRecogidas : setEntregas;
    setter(list => list.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };
  const addStop = (tipo: "recogida" | "entrega") => {
    const setter = tipo === "recogida" ? setRecogidas : setEntregas;
    setter(list => [...list, newParada(tipo)]);
  };
  const removeStop = (tipo: "recogida" | "entrega", idx: number) => {
    const setter = tipo === "recogida" ? setRecogidas : setEntregas;
    setter(list => (list.length <= 1 ? list : list.filter((_, i) => i !== idx)));
  };
  const moveStop = (tipo: "recogida" | "entrega", idx: number, dir: -1 | 1) => {
    const setter = tipo === "recogida" ? setRecogidas : setEntregas;
    setter(list => {
      const j = idx + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  };

  const handleSave = async () => {
    if (saving) return;
    const invalidRec = recogidas.some(p => !p.ubicacion.trim() || !p.fecha || !p.hora);
    const invalidEnt = entregas.some(p => !p.ubicacion.trim() || !p.fecha || !p.hora);
    if (invalidRec) {
      toast.error("Completa ubicación, fecha y hora de cada recogida");
      return;
    }
    if (invalidEnt) {
      toast.error("Completa ubicación, fecha y hora de cada entrega");
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

    const primeraRecogida = recogidas[0];
    const ultimaEntrega = entregas[entregas.length - 1];
    const paradas: Parada[] = [...recogidas, ...entregas];

    const today = format(new Date(), "yyyy-MM-dd");
    const payload = {
      fechaRecogida: primeraRecogida.fecha,
      horaRecogida: primeraRecogida.hora,
      horaSalidaRecogida: primeraRecogida.horaSalida ?? "",
      ubicacionRecogida: primeraRecogida.ubicacion,
      fechaEntrega: ultimaEntrega.fecha,
      horaEntrega: ultimaEntrega.hora,
      horaSalidaEntrega: ultimaEntrega.horaSalida ?? "",
      ubicacionEntrega: ultimaEntrega.ubicacion,
      millasVacias: form.millasVacias || 0,
      millasCargadas: form.millasCargadas || 0,
      pagoRecibido: form.pagoRecibido,
      costoGasolina: form.costoGasolina,
      gastosComida: 0,
      hospedaje: overnight ? form.hospedaje : 0,
      otrosGastos: 0,
      notas: form.notas,
      paradas,
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
          ubicacionCarretera: `${primeraRecogida.ubicacion} → ${ultimaEntrega.ubicacion}`,
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

  // Trip duration in hours (first pickup → last delivery)
  const duracionHoras = (() => {
    const pr = recogidas[0];
    const en = entregas[entregas.length - 1];
    if (!pr || !en || !pr.fecha || !pr.hora || !en.fecha || !en.hora) return 0;
    const start = new Date(`${pr.fecha}T${parseTime(pr.hora).time}`);
    const end = new Date(`${en.fecha}T${parseTime(en.hora).time}`);
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

  const renderParadaCard = (
    tipo: "recogida" | "entrega",
    p: Parada,
    idx: number,
    total: number
  ) => {
    const label = tipo === "recogida" ? "Recogida" : "Entrega";
    const list = tipo === "recogida" ? recogidas : entregas;
    return (
      <div key={`${tipo}-${idx}`} className="border border-border rounded-lg p-3 space-y-2 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            {tipo === "recogida" ? <MapPin className="w-4 h-4 text-primary" /> : <PackageCheck className="w-4 h-4 text-success" />}
            <span>{label} {idx + 1}{total > 1 ? ` de ${total}` : ""}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => moveStop(tipo, idx, -1)} aria-label="Subir">
              <ArrowUp className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === list.length - 1} onClick={() => moveStop(tipo, idx, 1)} aria-label="Bajar">
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" disabled={list.length <= 1} onClick={() => removeStop(tipo, idx)} aria-label="Eliminar">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <Input
          className="h-12 text-base"
          value={p.ubicacion}
          onChange={e => updateParada(tipo, idx, { ubicacion: e.target.value })}
          placeholder="Ciudad, Estado"
        />
        <Input
          className="h-12 text-base"
          type="date"
          value={p.fecha}
          onChange={e => updateParada(tipo, idx, { fecha: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Check-in</Label>
            <div className="flex gap-1">
              <Input
                className="h-12 text-base flex-1 min-w-0"
                type="time"
                value={parseTime(p.hora).time}
                onChange={e => updateParada(tipo, idx, { hora: buildTime(e.target.value, parseTime(p.hora).tz) })}
              />
              <Select value={parseTime(p.hora).tz} onValueChange={(v) => updateParada(tipo, idx, { hora: buildTime(parseTime(p.hora).time, v) })}>
                <SelectTrigger className="h-12 w-[72px] px-2 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Check-out</Label>
            <div className="flex gap-1">
              <Input
                className="h-12 text-base flex-1 min-w-0"
                type="time"
                value={parseTime(p.horaSalida).time}
                onChange={e => updateParada(tipo, idx, { horaSalida: buildTime(e.target.value, parseTime(p.horaSalida).tz) })}
              />
              <Select value={parseTime(p.horaSalida).tz} onValueChange={(v) => updateParada(tipo, idx, { horaSalida: buildTime(parseTime(p.horaSalida).time, v) })}>
                <SelectTrigger className="h-12 w-[72px] px-2 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Textarea
          value={p.notas ?? ""}
          onChange={e => updateParada(tipo, idx, { notas: e.target.value })}
          placeholder="Notas de esta parada (opcional)"
          rows={2}
        />
      </div>
    );
  };

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
                {/* Pickups */}
                <div className="space-y-2">
                  <Label className="text-base">Recogidas *</Label>
                  <div className="space-y-2">
                    {recogidas.map((p, i) => renderParadaCard("recogida", p, i, recogidas.length))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addStop("recogida")}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar recogida
                  </Button>
                </div>

                {/* Deliveries */}
                <div className="space-y-2">
                  <Label className="text-base">Entregas *</Label>
                  <div className="space-y-2">
                    {entregas.map((p, i) => renderParadaCard("entrega", p, i, entregas.length))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addStop("entrega")}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar entrega
                  </Button>
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
            const totalParadas = c.paradas?.length ?? 0;
            const hasMultiStop = totalParadas > 2;
            return (
              <div key={c.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full p-3 flex items-center justify-between text-left"
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-semibold truncate">{c.ubicacionRecogida} → {c.ubicacionEntrega}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.fechaRecogida}
                      {hasMultiStop && <span className="ml-1">· {totalParadas} paradas</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${c.gananciaNeta >= 0 ? "text-success" : "text-destructive"}`}>
                      {formatMoney(c.gananciaNeta)}
                    </span>
                    {expanded === c.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expanded === c.id && (
                  <div className="px-3 pb-3 border-t border-border pt-2 text-sm space-y-2 animate-slide-up">
                    {hasMultiStop && c.paradas && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ruta</div>
                        <ol className="space-y-1.5">
                          {c.paradas.map((p, i) => {
                            const isRec = p.tipo === "recogida";
                            const sameTypeIdx = c.paradas!.slice(0, i + 1).filter(x => x.tipo === p.tipo).length;
                            return (
                              <li key={i} className="flex gap-2">
                                <div className="flex flex-col items-center">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isRec ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`}>
                                    {i + 1}
                                  </div>
                                  {i < c.paradas!.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                                </div>
                                <div className="flex-1 pb-1">
                                  <div className="text-xs font-semibold">
                                    {isRec ? `Recogida ${sameTypeIdx}` : `Entrega ${sameTypeIdx}`}
                                  </div>
                                  <div className="text-sm">{p.ubicacion}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {p.fecha}{p.hora ? ` · ${p.hora}` : ""}
                                    {p.horaSalida ? ` → ${p.horaSalida}` : ""}
                                  </div>
                                  {p.notas && <div className="text-xs text-muted-foreground italic mt-0.5">{p.notas}</div>}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}

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
