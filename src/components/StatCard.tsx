import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "destructive" | "accent";
}

const variantClasses = {
  default: "bg-card text-card-foreground",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  accent: "bg-accent/10 text-accent",
};

export default function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-lg p-3 ${variantClasses[variant]} border border-border`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="opacity-70">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold font-display animate-count-up">{value}</p>
    </div>
  );
}
