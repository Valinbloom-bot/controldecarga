import { Link } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";

export default function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-4 border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Control de Cargas</span>
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <article className="prose prose-sm max-w-none text-foreground space-y-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:leading-relaxed [&_a]:text-primary [&_a]:underline">
          {children}
        </article>
        <footer className="mt-12 pt-6 border-t text-xs text-muted-foreground flex flex-wrap gap-4">
          <Link to="/terminos" className="hover:text-foreground">Términos</Link>
          <Link to="/privacidad" className="hover:text-foreground">Privacidad</Link>
          <Link to="/reembolsos" className="hover:text-foreground">Reembolsos</Link>
          <Link to="/precios" className="hover:text-foreground">Precios</Link>
        </footer>
      </main>
    </div>
  );
}
