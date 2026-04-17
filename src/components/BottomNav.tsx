import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Truck, Fuel, CreditCard, Wrench, BarChart3, CalendarRange } from "lucide-react";

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Panel" },
  { to: "/cargas", icon: Truck, label: "Cargas" },
  { to: "/gasolina", icon: Fuel, label: "Gas" },
  { to: "/peajes", icon: CreditCard, label: "Peajes" },
  { to: "/gastos-vehiculo", icon: Wrench, label: "Vehículo" },
  { to: "/semanal", icon: BarChart3, label: "Semanal" },
  { to: "/metas", icon: CalendarRange, label: "Mes" },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
