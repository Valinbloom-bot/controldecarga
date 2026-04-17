import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportMenuProps {
  onCSV: () => void;
  onPDF: () => void;
  disabled?: boolean;
  emptyMessage?: string;
}

export default function ExportMenu({ onCSV, onPDF, disabled, emptyMessage = "No hay datos para exportar" }: ExportMenuProps) {
  const handle = (fn: () => void) => {
    if (disabled) {
      toast.error(emptyMessage);
      return;
    }
    try {
      fn();
      toast.success("Exportación lista");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" /> Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handle(onCSV)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle(onPDF)}>
          <FileText className="w-4 h-4 mr-2" /> Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
