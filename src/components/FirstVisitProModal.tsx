import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";

const STORAGE_KEY = "controldecarga.proModalShown";

const PERKS = [
  "Cargas y gastos sin límite",
  "Reportes y exportaciones completas",
  "Cancela cuando quieras durante la prueba",
];

/**
 * Shows once per user after first login if they have no paid/trial/comp/admin access.
 */
export default function FirstVisitProModal() {
  const { user } = useAuth();
  const { hasFullAccess, loading } = useAccessStatus();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || loading || hasFullAccess) return;
    const key = `${STORAGE_KEY}.${user.id}`;
    if (localStorage.getItem(key)) return;
    const t = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(key, "1");
    }, 600);
    return () => clearTimeout(t);
  }, [user, loading, hasFullAccess]);

  const handleStart = () => {
    setOpen(false);
    navigate("/precios");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center">Prueba Plan Pro 7 días gratis</DialogTitle>
          <DialogDescription className="text-center">
            Registra cargas, gasolina, peajes y gastos sin límite.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 my-2">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span>{p}</span>
            </li>
          ))}
        </ul>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={handleStart}>
            Empezar prueba gratis
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Quizás más tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
