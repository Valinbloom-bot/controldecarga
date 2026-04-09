import { useAppData } from "@/context/AppContext";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export default function Configuracion() {
  const { data, toggleDarkMode } = useAppData();

  return (
    <div className="pb-20">
      <PageHeader title="Configuración" />
      <div className="px-4 space-y-4">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <Label>Modo oscuro</Label>
          </div>
          <Switch checked={data.darkMode} onCheckedChange={toggleDarkMode} />
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Acerca de</h3>
          <p className="text-xs text-muted-foreground">Control de Cargas v1.0</p>
          <p className="text-xs text-muted-foreground">App para transportistas independientes</p>
        </div>
      </div>
    </div>
  );
}
