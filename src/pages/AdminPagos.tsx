import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { PAYMENTS_ENV } from "@/lib/stripe";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

type EnvProbe = {
  configured: boolean;
  ok: boolean;
  livemode?: boolean | null;
  account_id?: string | null;
  country?: string | null;
  default_currency?: string | null;
  business_profile_name?: string | null;
  charges_enabled?: boolean | null;
  payouts_enabled?: boolean | null;
  details_submitted?: boolean | null;
  error?: string;
};

type StatusData = {
  sandbox: EnvProbe;
  live: EnvProbe;
  webhook_secrets: { sandbox_configured: boolean; live_configured: boolean };
  webhook_endpoint: string;
};

function Pill({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  const cls = {
    ok: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    bad: "bg-destructive/15 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {children}
    </span>
  );
}

function BoolIcon({ value }: { value: boolean | null | undefined }) {
  if (value === true) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (value === false) return <XCircle className="w-4 h-4 text-destructive" />;
  return <span className="text-muted-foreground text-xs">—</span>;
}

function EnvCard({ label, env, isActive }: { label: string; env: EnvProbe; isActive: boolean }) {
  const tone: "ok" | "warn" | "bad" | "muted" = !env.configured
    ? "muted"
    : !env.ok
    ? "bad"
    : env.charges_enabled
    ? "ok"
    : "warn";

  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{label}</CardTitle>
          <div className="flex items-center gap-2">
            {isActive && <Pill tone="ok">EN USO</Pill>}
            {!env.configured && <Pill tone="muted">Sin clave</Pill>}
            {env.configured && env.ok && env.charges_enabled && <Pill tone="ok">Operativa</Pill>}
            {env.configured && env.ok && !env.charges_enabled && <Pill tone="warn">Sin cobros</Pill>}
            {env.configured && !env.ok && <Pill tone="bad">Error</Pill>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        {!env.configured && (
          <p className="text-muted-foreground">
            No hay clave configurada para este entorno.
          </p>
        )}
        {env.configured && !env.ok && (
          <p className="text-destructive text-xs break-all">{env.error}</p>
        )}
        {env.configured && env.ok && (
          <>
            <Row label="Account ID" value={env.account_id ?? "—"} mono />
            <Row label="Modo Stripe" value={
              env.livemode === true ? "LIVE (real)" : env.livemode === false ? "TEST" : "—"
            } />
            <Row label="País" value={env.country?.toUpperCase() ?? "—"} />
            <Row label="Moneda" value={env.default_currency?.toUpperCase() ?? "—"} />
            <Row label="Negocio" value={env.business_profile_name ?? "—"} />
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <BoolField label="Cobros" value={env.charges_enabled} />
              <BoolField label="Pagos a banco" value={env.payouts_enabled} />
              <BoolField label="Verificada" value={env.details_submitted} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-xs text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function BoolField({ label, value }: { label: string; value: boolean | null | undefined }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <BoolIcon value={value} />
      <span className="text-[10px] text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default function AdminPagos() {
  const { isAdmin, loading: loadingRole } = useUserRole();
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("stripe-status");
    if (error) {
      setError(error.message);
      toast.error("No se pudo consultar el estado de Stripe");
    } else {
      setStatus(data as StatusData);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchStatus();
  }, [isAdmin]);

  if (loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/panel" replace />;

  const frontendIsLive = PAYMENTS_ENV === "live";
  const activeProbe = frontendIsLive ? status?.live : status?.sandbox;
  const mismatch =
    !!status &&
    !!activeProbe?.ok &&
    activeProbe.livemode !== null &&
    activeProbe.livemode !== frontendIsLive;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado");
  };

  return (
    <div className="pb-24">
      <PageHeader title="Pagos · Estado" />

      <div className="px-4 space-y-4">
        {/* Top summary */}
        <Card className={frontendIsLive ? "border-emerald-500/40" : "border-amber-500/40"}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Modo activo de la app</div>
                <div className="flex items-center gap-2">
                  {frontendIsLive ? (
                    <Pill tone="ok">LIVE · cobros reales</Pill>
                  ) : (
                    <Pill tone="warn">TEST · sin cobros</Pill>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Determinado por <code className="text-[10px]">VITE_PAYMENTS_CLIENT_TOKEN</code>{" "}
                  ({frontendIsLive ? "pk_live_…" : "pk_test_…"}).
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {mismatch && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-destructive mb-1">¡Modo desincronizado!</div>
                El frontend está en <strong>{frontendIsLive ? "LIVE" : "TEST"}</strong> pero la clave secreta
                activa está en <strong>{activeProbe?.livemode ? "LIVE" : "TEST"}</strong>. Los pagos fallarán.
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="pt-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {loading && !status && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {status && (
          <>
            <EnvCard label="Stripe TEST" env={status.sandbox} isActive={!frontendIsLive} />
            <EnvCard label="Stripe LIVE" env={status.live} isActive={frontendIsLive} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Webhook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">URL para registrar en Stripe</div>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] flex-1 break-all bg-muted px-2 py-1.5 rounded">
                      {status.webhook_endpoint}
                    </code>
                    <Button size="icon" variant="ghost" onClick={() => copy(status.webhook_endpoint)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs">
                    <BoolIcon value={status.webhook_secrets.sandbox_configured} />
                    <span>Secret TEST</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <BoolIcon value={status.webhook_secrets.live_configured} />
                    <span>Secret LIVE</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Configura un endpoint en Stripe (TEST y LIVE) con esa URL. Eventos:
                  checkout.session.completed, customer.subscription.created, .updated, .deleted,
                  invoice.payment_succeeded, invoice.payment_failed.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Link to="/admin">
          <Button variant="ghost" size="sm" className="w-full">
            <ExternalLink className="w-3.5 h-3.5" />
            Volver a Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
