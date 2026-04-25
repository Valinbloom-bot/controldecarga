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
  horaRecogida: `${format(new Date(), "HH:mm")} ET`,
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
      toast.info("You hit the free limit. Start your trial to log more.");
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
      toast.error("Complete pickup and delivery");
      return;
    }
    if (!form.fechaRecogida || !form.horaRecogida) {
      toast.error("Enter pickup date and time");
      return;
    }
    if (!form.fechaEntrega || !form.horaEntrega) {
      toast.error("Enter delivery date and time");
      return;
    }
    if (millasTotalCalc <= 0) {
      toast.error("Enter miles (deadhead or loaded)");
      return;
    }
    if (!form.pagoRecibido || form.pagoRecibido <= 0) {
      toast.error("Enter the payment received");
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
          notas: "Auto-logged from load",
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

  const duracionHoras = (() => {
    if (!form.fechaRecogida || !form.horaRecogida || !form.fechaEntrega || !form.horaEntrega) return 0;
    const start = new Date(`${form.fechaRecogida}T${parseTime(form.horaRecogida).time}`);
    const end = new Date(`${form.fechaEntrega}T${parseTime(form.horaEntrega).time}`);
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
        title="Loads"
        action={
          <>
          <ExportMenu
            items={data.cargas}
            getDate={(c) => c.fechaRecogida}
            onCSV={(f) => exportCargasCSV(f)}
            onPDF={(f) => exportCargasPDF(f)}
            emptyMessage="No loads"
          />
          <Dialog open={open} onOpenChange={(v) => { if (!saving) setOpen(v); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}>
                <Plus className="w-4 h-4 mr-1" /> New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto max-w-md" onInteractOutside={(e) => { if (saving) e.preventDefault(); }} onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }}>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Load" : "New Load"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-base">Pickup *</Label>
                  <Input
                    className="h-12 text-base"
                    value={form.ubicacionRecogida}
                    onChange={e => setField("ubicacionRecogida", e.target.value)}
                    placeholder="City, State"
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
                      <div className="flex gap-1">
                        <Input
                          className="h-12 text-base flex-1 min-w-0"
                          type="time"
                          value={parseTime(form.horaRecogida).time}
                          onChange={e => setField("horaRecogida", buildTime(e.target.value, parseTime(form.horaRecogida).tz))}
                        />
                        <Select value={parseTime(form.horaRecogida).tz} onValueChange={(v) => setField("horaRecogida", buildTime(parseTime(form.horaRecogida).time, v))}>
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
                          value={parseTime(form.horaSalidaRecogida).time}
                          onChange={e => setField("horaSalidaRecogida", buildTime(e.target.value, parseTime(form.horaSalidaRecogida).tz))}
                        />
                        <Select value={parseTime(form.horaSalidaRecogida).tz} onValueChange={(v) => setField("horaSalidaRecogida", buildTime(parseTime(form.horaSalidaRecogida).time, v))}>
                          <SelectTrigger className="h-12 w-[72px] px-2 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-base">Delivery *</Label>
                  <Input
                    className="h-12 text-base"
                    value={form.ubicacionEntrega}
                    onChange={e => setField("ubicacionEntrega", e.target.value)}
                    placeholder="City, State"
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
                      <div className="flex gap-1">
                        <Input
                          className="h-12 text-base flex-1 min-w-0"
                          type="time"
                          value={parseTime(form.horaEntrega).time}
                          onChange={e => setField("horaEntrega", buildTime(e.target.value, parseTime(form.horaEntrega).tz))}
                        />
                        <Select value={parseTime(form.horaEntrega).tz} onValueChange={(v) => setField("horaEntrega", buildTime(parseTime(form.horaEntrega).time, v))}>
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
                          value={parseTime(form.horaSalidaEntrega).time}
                          onChange={e => setField("horaSalidaEntrega", buildTime(e.target.value, parseTime(form.horaSalidaEntrega).tz))}
                        />
                        <Select value={parseTime(form.horaSalidaEntrega).tz} onValueChange={(v) => setField("horaSalidaEntrega", buildTime(parseTime(form.horaSalidaEntrega).time, v))}>
                          <SelectTrigger className="h-12 w-[72px] px-2 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Miles *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Deadhead (DH)</Label>
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
                      <Label className="text-xs text-muted-foreground">Loaded</Label>
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
                    <Label className="text-xs text-muted-foreground">Total (auto)</Label>
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
                  <Label className="text-base">Payment $ *</Label>
                  <Input
                    className="h-12 text-base"
                    type="number"
                    inputMode="decimal"
                    value={form.pagoRecibido || ""}
                    onChange={e => numField("pagoRecibido", e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="overnight" className="text-base cursor-pointer">Overnight trip</Label>
                  </div>
                  <Switch id="overnight" checked={overnight} onCheckedChange={setOvernight} />
                </div>

                {overnight && (
                  <div className="space-y-1.5 animate-slide-up">
                    <Label className="text-base">Lodging $</Label>
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

                <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium"
                    >
                      <span>Additional expenses (optional)</span>
                      {extrasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    {linkedGasForEdit.length > 0 ? (
                      <div className="bg-primary/10 border border-primary/20 p-3 rounded space-y-1">
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Fuel className="w-4 h-4" /> Linked fuel: {formatMoney(linkedGasCost)}
                        </div>
                        <p className="text-xs text-muted-foreground">From Fuel Tracker.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Label>Fuel $</Label>
                        <Input type="number" inputMode="decimal" value={form.costoGasolina || ""} onChange={e => numField("costoGasolina", e.target.value)} placeholder="0" />
                      </div>
                    )}
                    {!editing && (
                      <div className="space-y-1.5">
                        <Label>Tolls $</Label>
                        <Input type="number" inputMode="decimal" value={form.peajes || ""} onChange={e => numField("peajes", e.target.value)} placeholder="0" />
                        <p className="text-xs text-muted-foreground">Will be saved in Tolls.</p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total expenses:</span>
                    <strong className="text-destructive">{formatMoney(totalGastos)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net profit:</span>
                    <strong className={gananciaNeta >= 0 ? "text-success" : "text-destructive"}>{formatMoney(gananciaNeta)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit/mile:</span>
                    <strong>{formatMoney(gananciaPorMilla)}</strong>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 mt-1">
                    <span className="text-muted-foreground">Trip duration:</span>
                    <strong>{formatDuracion(duracionHoras)}</strong>
                  </div>
                  {duracionHoras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit/hour:</span>
                      <strong>{formatMoney(gananciaPorHora)}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea value={form.notas} onChange={e => setField("notas", e.target.value)} placeholder="Optional notes" rows={2} />
                </div>

                <Button className="w-full h-12 text-base" size="lg" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : (editing ? "Save Changes" : "Save Load")}
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
          <p className="text-lg mb-2">No loads logged yet</p>
          <p className="text-sm">Tap "New" to add your first load</p>
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
                      <span className="text-muted-foreground">Payment:</span><span className="font-medium">{formatMoney(c.pagoRecibido)}</span>
                      <span className="text-muted-foreground">Miles:</span><span>{formatNumber(c.millasTotal, 0)}</span>
                      <span className="text-muted-foreground">Expenses:</span><span className="text-destructive">{formatMoney(c.totalGastos)}</span>
                      <span className="text-muted-foreground">$/Mile:</span><span>{formatMoney(c.gananciaPorMilla)}</span>
                    </div>

                    {linkedGas.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded p-2 space-y-1">
                        <div className="flex items-center gap-1 font-medium text-primary text-xs">
                          <Fuel className="w-3 h-3" /> Linked fuel ({formatMoney(linkedTotal)})
                        </div>
                        {linkedGas.map(g => (
                          <div key={g.id} className="text-xs text-muted-foreground pl-4">
                            {g.fecha} · {g.gasolinera || "Station"} · {g.galones} gal · {formatMoney(g.totalGasolina)}
                          </div>
                        ))}
                      </div>
                    )}

                    {c.notas && <p className="text-muted-foreground italic">{c.notas}</p>}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => handleOpen(c)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCarga(c.id)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
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
