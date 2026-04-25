import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportMenuProps<T> {
  items: T[];
  getDate: (item: T) => string; // yyyy-MM-dd
  onCSV: (filtered: T[]) => void;
  onPDF: (filtered: T[]) => void;
  emptyMessage?: string;
}

export default function ExportMenu<T>({
  items,
  getDate,
  onCSV,
  onPDF,
  emptyMessage = "No data to export",
}: ExportMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const d = getDate(it);
      if (!d) return !from && !to;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [items, from, to, getDate]);

  const run = (fn: (f: T[]) => void) => {
    if (filtered.length === 0) {
      toast.error(items.length === 0 ? emptyMessage : "No records in the selected range");
      return;
    }
    try {
      fn(filtered);
      toast.success(`Export ready (${filtered.length} record${filtered.length === 1 ? "" : "s"})`);
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Export failed");
    }
  };

  const clearRange = () => { setFrom(""); setTo(""); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export data</DialogTitle>
          <DialogDescription>
            Filter by date range (optional) and choose a format.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} of {items.length} record{items.length === 1 ? "" : "s"}</span>
            {(from || to) && (
              <button type="button" className="underline" onClick={clearRange}>
                Clear
              </button>
            )}
          </div>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => run(onCSV)}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button onClick={() => run(onPDF)}>
            <FileText className="w-4 h-4 mr-1" /> PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
