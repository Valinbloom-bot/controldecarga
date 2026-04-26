import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Truck, Fuel, Receipt, BarChart3, Check, Sparkles } from "lucide-react";
import { getPostLoginPath } from "@/lib/vip-access";

const FEATURES = [
  { icon: Truck, title: "Cargas sin límite", desc: "Registra cada viaje con millas, pago bruto y notas." },
  { icon: Fuel, title: "Gasolina y peajes", desc: "Controla cada galón y cada peaje vinculado a tus cargas." },
  { icon: Receipt, title: "Gastos del vehículo", desc: "Mantenimiento, reparaciones y todo gasto operativo." },
  { icon: BarChart3, title: "Reportes y metas", desc: "Resúmenes semanales, mensuales y ganancia por milla." },
];

const PLANS = [
  { name: "Mensual", price: "$4.99", period: "/mes", badge: null as string | null },
  { name: "Anual", price: "$39.99", period: "/año", badge: "Ahorra 33%" },
];

export default function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={getPostLoginPath(user.email)} replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          <span className="font-bold">Control de Cargas</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Iniciar sesión</Button></Link>
          <Link to="/auth"><Button size="sm">Empezar</Button></Link>
        </div>
      </header>

      <section className="px-4 pt-8 pb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> 7 días gratis
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          La app de control de cargas para truckers
        </h1>
        <p className="text-muted-foreground mb-6 text-base md:text-lg">
          Registra cargas, gasolina, peajes y gastos. Conoce tu ganancia real por milla, semana y mes.
        </p>
        <Link to="/auth"><Button size="lg">Empieza tu prueba gratis</Button></Link>
        <p className="text-xs text-muted-foreground mt-3">Sin tarjeta requerida para registrarte.</p>
      </section>

      <section className="px-4 py-8 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">Todo lo que necesitas en una sola app</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="precios" className="px-4 py-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-2">Precios simples</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          7 días de prueba gratis. Cancela cuando quieras.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLANS.map((p) => (
            <Card key={p.name} className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{p.name}</h3>
                {p.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="mb-3">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="space-y-1.5 text-sm mb-4">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Cargas, gasolina y peajes ilimitados</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Reportes semanales y mensuales</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Exportar a CSV y PDF</li>
              </ul>
              <Link to="/auth"><Button className="w-full">Empezar prueba de 7 días</Button></Link>
            </Card>
          ))}
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-4">
          Después de la prueba se cobra automáticamente. Puedes cancelar en cualquier momento desde tu cuenta.
        </p>
      </section>

      <footer className="border-t mt-12 px-4 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} VAL IN BLOOM. Todos los derechos reservados.</div>
          <nav className="flex gap-4">
            <Link to="/precios" className="hover:text-foreground">Precios</Link>
            <Link to="/terminos" className="hover:text-foreground">Términos</Link>
            <Link to="/privacidad" className="hover:text-foreground">Privacidad</Link>
            <Link to="/reembolsos" className="hover:text-foreground">Reembolsos</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
