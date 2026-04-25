import { useState } from "react";
import { useAppData } from "@/context/AppContext";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, FileText, FileSpreadsheet, Truck, Fuel, CreditCard, BarChart3, FileDown, Sparkles, ChevronRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import {
  exportCargasCSV, exportCargasPDF,
  exportGasolinaCSV, exportGasolinaPDF,
  exportPeajesCSV, exportPeajesPDF,
  exportResumenMensualCSV, exportResumenMensualPDF,
  exportNegocioCompletoPDF,
} from "@/lib/exports";
import { format } from "date-fns";
import { toast } from "sonner";

interface RowProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  onCSV: () => void;
  onPDF: () => void;
  disabled?: boolean;
}

function ExportRow({ icon, title, count, onCSV, onPDF, disabled }: RowProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{count} record{count === 1 ? "" : "s"}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" disabled={disabled} onClick={onCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
        </Button>
        <Button size="sm" variant="outline" disabled={disabled} onClick={onPDF}>
          <FileText className="w-4 h-4 mr-1" /> PDF
        </Button>
      </div>
    </div>
  );
}

export default function Configuracion() {
  const { data, toggleDarkMode } = useAppData();
  const { isActive, isTrialing, hasComp, isAdmin } = useAccessStatus();
  const [mes, setMes] = useState(format(new Date(), "yyyy-MM"));

  const safe = (fn: () => void, emptyMsg: string, isEmpty: boolean) => () => {
    if (isEmpty) { toast.error(emptyMsg); return; }
    try { fn(); toast.success("Export ready"); }
    catch (e) { toast.error("Export failed"); console.error(e); }
  };

  const accessTitle = isAdmin ? "Admin access"
    : hasComp ? "Free access active"
    : isActive ? (isTrialing ? "Trial period active" : "Pro plan active")
    : "Subscription";

  const accessBody = isAdmin ? "Manage users and access without restrictions"
    : hasComp ? "Your access is enabled with no charges"
    : isActive ? "Manage plan"
    : "Start your 7-day free trial";

  return (
    <div className="pb-20">
      <PageHeader title="Settings" />
      <div className="px-4 space-y-4">
        <Link to={isAdmin ? "/admin" : "/precios"} className="block bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              {isAdmin ? <Shield className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{accessTitle}</div>
              <div className="text-xs text-muted-foreground">{accessBody}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>

        {isAdmin && (
          <Link to="/admin" className="block bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Shield className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Admin panel</div>
                <div className="text-xs text-muted-foreground">Manage free access and users</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        )}

        <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <Label>Dark mode</Label>
          </div>
          <Switch checked={data.darkMode} onCheckedChange={toggleDarkMode} />
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Export data</h2>
          <div className="space-y-2">
            <ExportRow icon={<Truck className="w-5 h-5" />} title="Loads" count={data.cargas.length}
              onCSV={safe(() => exportCargasCSV(data.cargas), "No loads", data.cargas.length === 0)}
              onPDF={safe(() => exportCargasPDF(data.cargas), "No loads", data.cargas.length === 0)} />
            <ExportRow icon={<Fuel className="w-5 h-5" />} title="Fuel" count={data.gasolina.length}
              onCSV={safe(() => exportGasolinaCSV(data.gasolina), "No fuel entries", data.gasolina.length === 0)}
              onPDF={safe(() => exportGasolinaPDF(data.gasolina), "No fuel entries", data.gasolina.length === 0)} />
            <ExportRow icon={<CreditCard className="w-5 h-5" />} title="Tolls" count={data.peajes.length}
              onCSV={safe(() => exportPeajesCSV(data.peajes), "No tolls", data.peajes.length === 0)}
              onPDF={safe(() => exportPeajesPDF(data.peajes), "No tolls", data.peajes.length === 0)} />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Monthly summary</h2>
          <div className="bg-card border border-border rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
              <div className="flex-1">
                <Label className="text-xs">Month</Label>
                <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={safe(() => exportResumenMensualCSV(data.cargas, data.gasolina, data.peajes, mes), "Select a valid month", !mes)}>
                <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={safe(() => exportResumenMensualPDF(data.cargas, data.gasolina, data.peajes, mes), "Select a valid month", !mes)}>
                <FileText className="w-4 h-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Full report</h2>
          <div className="bg-card border border-border rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileDown className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Whole business in one PDF</div>
                <div className="text-xs text-muted-foreground">Summary + loads + fuel + tolls</div>
              </div>
            </div>
            <Button size="sm" className="w-full"
              onClick={safe(() => exportNegocioCompletoPDF(data.cargas, data.gasolina, data.peajes, mes || undefined),
                "No data", data.cargas.length === 0 && data.gasolina.length === 0 && data.peajes.length === 0)}>
              <FileDown className="w-4 h-4 mr-1" /> Export full PDF
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">About</h3>
          <p className="text-xs text-muted-foreground">LoadNest v1.0</p>
          <p className="text-xs text-muted-foreground">App for independent truck drivers</p>
        </div>
      </div>
    </div>
  );
}
