import { useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { useSubscription } from "@/hooks/useSubscription";

export const FREE_TIER_LIMIT = 5;

export type Resource = "cargas" | "gasolina" | "peajes" | "gastosVehiculo";

const LABELS: Record<Resource, { singular: string; plural: string }> = {
  cargas: { singular: "carga", plural: "cargas" },
  gasolina: { singular: "registro de gasolina", plural: "registros de gasolina" },
  peajes: { singular: "peaje", plural: "peajes" },
  gastosVehiculo: { singular: "gasto del vehículo", plural: "gastos del vehículo" },
};

export function useUsageGate(resource: Resource) {
  const { data } = useAppData();
  const { isActive, loading } = useSubscription();

  const count = useMemo(() => (data[resource] as unknown[])?.length ?? 0, [data, resource]);
  const remaining = Math.max(0, FREE_TIER_LIMIT - count);
  const blocked = !isActive && count >= FREE_TIER_LIMIT;

  return {
    count,
    limit: FREE_TIER_LIMIT,
    remaining,
    blocked,
    loading,
    isActive,
    label: LABELS[resource],
  };
}
