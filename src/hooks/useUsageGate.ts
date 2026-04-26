import { useMemo } from "react";
import { useAppData } from "@/context/AppContext";
import { useAccessStatus } from "@/hooks/useAccessStatus";

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
  const { hasFullAccess, loading } = useAccessStatus();

  const count = useMemo(() => (data[resource] as unknown[])?.length ?? 0, [data, resource]);
  const remaining = Math.max(0, FREE_TIER_LIMIT - count);
  const blocked = !hasFullAccess && count >= FREE_TIER_LIMIT;

  return {
    count,
    limit: FREE_TIER_LIMIT,
    remaining,
    blocked,
    loading,
    isActive: hasFullAccess,
    label: LABELS[resource],
  };
}
