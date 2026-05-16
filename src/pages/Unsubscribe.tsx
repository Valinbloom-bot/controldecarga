import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "loading" | "valid" | "already" | "invalid" | "submitting" | "success" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      setMessage("Falta el token de cancelación.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_KEY } }
        );
        const data = await res.json();
        if (res.ok && data.valid) setState("valid");
        else if (data?.reason === "already_unsubscribed") setState("already");
        else { setState("invalid"); setMessage(data?.error || "Token inválido o expirado."); }
      } catch {
        setState("error");
        setMessage("No se pudo verificar el token.");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("submitting");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.success) setState("success");
      else if (data?.reason === "already_unsubscribed") setState("already");
      else { setState("error"); setMessage(data?.error || "No se pudo procesar."); }
    } catch {
      setState("error");
      setMessage("Error de red.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cancelar suscripción de correos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === "loading" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando…
            </div>
          )}
          {state === "valid" && (
            <>
              <p className="text-sm text-muted-foreground">
                ¿Quieres dejar de recibir correos de Control de Cargas?
              </p>
              <Button onClick={confirm} className="w-full">Confirmar cancelación</Button>
            </>
          )}
          {state === "submitting" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Procesando…
            </div>
          )}
          {state === "success" && (
            <div className="flex items-start gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p>Listo, ya no recibirás más correos.</p>
            </div>
          )}
          {state === "already" && (
            <div className="flex items-start gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p>Ya estabas dado de baja.</p>
            </div>
          )}
          {(state === "invalid" || state === "error") && (
            <div className="flex items-start gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
