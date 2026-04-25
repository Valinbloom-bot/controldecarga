import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Truck, Loader2, CheckCircle2 } from "lucide-react";

const passwordSchema = z
  .object({
    password: z.string().min(6, "Minimum 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [validRecovery, setValidRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { setValidRecovery(true); setReady(true); }
    });

    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setValidRecovery(true);
    const t = setTimeout(() => setReady(true), 600);

    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse({ password, confirm });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) { toast.error(error.message); return; }
      setDone(true);
      toast.success("Password updated");
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth", { replace: true }), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-3">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">New password</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Choose a new password for your account</p>
        </div>

        <Card className="p-6">
          {!ready ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Password updated!</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecting to sign in…</p>
            </div>
          ) : !validRecovery ? (
            <div className="text-center space-y-3">
              <p className="text-sm">This recovery link is invalid or has expired.</p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" required />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
