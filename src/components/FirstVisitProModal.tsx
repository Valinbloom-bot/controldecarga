import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { isVipEmail } from "@/lib/vip-access";

const STORAGE_KEY = "loadnest.proModalShown";

const PERKS = [
  "Unlimited loads and expenses",
  "Full reports and exports",
  "Cancel anytime during the trial",
];

export default function FirstVisitProModal() {
  const { user } = useAuth();
  const { hasFullAccess, loading } = useAccessStatus();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isVip = isVipEmail(user?.email);

  useEffect(() => {
    if (!user || loading || hasFullAccess || isVip) return;
    const key = `${STORAGE_KEY}.${user.id}`;
    if (localStorage.getItem(key)) return;
    const t = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(key, "1");
    }, 600);
    return () => clearTimeout(t);
  }, [user, loading, hasFullAccess, isVip]);

  if (isVip) return null;

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
          <DialogTitle className="text-center">Try Pro free for 7 days</DialogTitle>
          <DialogDescription className="text-center">
            Log loads, fuel, tolls, and expenses with no limits.
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
            Start free trial
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
