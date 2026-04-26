import { Carga, RegistroGasolina, RegistroPeaje, GastoVehiculo } from "@/types";
import { startOfWeek, endOfWeek, format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function filterByDateRange<T extends { fecha?: string; fechaRecogida?: string }>(
  items: T[],
  start: Date,
  end: Date
): T[] {
  return items.filter(item => {
    const dateStr = (item as any).fechaRecogida || (item as any).fecha;
    if (!dateStr) return false;
    try {
      const d = parseISO(dateStr);
      return isWithinInterval(d, { start, end });
    } catch {
      return false;
    }
  });
}

export function filterByMonth<T extends { fecha?: string; fechaRecogida?: string }>(
  items: T[],
  yearMonth: string // YYYY-MM
): T[] {
  const [y, m] = yearMonth.split("-").map(Number);
  const start = startOfMonth(new Date(y, m - 1));
  const end = endOfMonth(new Date(y, m - 1));
  return filterByDateRange(items, start, end);
}

export interface WeeklySummary {
  weekLabel: string;
  start: Date;
  end: Date;
  totalCargas: number;
  millasTotal: number;
  ingresosTotal: number;
  gastoGasolina: number;
  gastoComida: number;
  gastoHospedaje: number;
  gastoPeajes: number;
  gastoVehiculo: number;
  otrosGastos: number;
  gastosTotal: number;
  gananciaNeta: number;
  ingresoPromedioPorCarga: number;
  gananciaPorMilla: number;
}

export function computeWeeklySummary(
  cargas: Carga[],
  gasolina: RegistroGasolina[],
  peajes: RegistroPeaje[],
  weekDate: Date,
  gastosVehiculo: GastoVehiculo[] = []
): WeeklySummary {
  const { start, end } = getWeekRange(weekDate);
  const wCargas = filterByDateRange(cargas, start, end);
  const wGas = filterByDateRange(gasolina, start, end);
  const wPeajes = filterByDateRange(peajes, start, end);
  const wVeh = filterByDateRange(gastosVehiculo, start, end);

  const totalCargas = wCargas.length;
  const millasTotal = wCargas.reduce((s, c) => s + c.millasTotal, 0);
  const ingresosTotal = wCargas.reduce((s, c) => s + c.pagoRecibido, 0);
  const unlinkedGas = wGas.filter(g => !g.cargaId);
  const gastoGasolinaFromLoads = wCargas.reduce((s, c) => {
    const linkedCost = wGas.filter(g => g.cargaId === c.id).reduce((a, g) => a + g.totalGasolina, 0);
    return s + (linkedCost > 0 ? linkedCost : (c.costoGasolina || 0));
  }, 0);
  const gastoGasolina = gastoGasolinaFromLoads + unlinkedGas.reduce((s, g) => s + g.totalGasolina, 0);
  const gastoComida = wCargas.reduce((s, c) => s + c.gastosComida, 0) + unlinkedGas.reduce((s, g) => s + g.snackComida, 0);
  const gastoHospedaje = wCargas.reduce((s, c) => s + c.hospedaje, 0);
  const gastoPeajes = wPeajes.reduce((s, p) => s + p.monto, 0);
  const gastoVehiculo = wVeh.reduce((s, v) => s + v.monto, 0);
  const otrosGastos = wCargas.reduce((s, c) => s + c.otrosGastos, 0);
  const gastosTotal = gastoGasolina + gastoComida + gastoHospedaje + gastoPeajes + gastoVehiculo + otrosGastos;
  const gananciaNeta = ingresosTotal - gastosTotal;
  const ingresoPromedioPorCarga = totalCargas > 0 ? ingresosTotal / totalCargas : 0;
  const gananciaPorMilla = millasTotal > 0 ? gananciaNeta / millasTotal : 0;

  return {
    weekLabel: `${format(start, "dd MMM", { locale: es })} - ${format(end, "dd MMM yyyy", { locale: es })}`,
    start, end, totalCargas, millasTotal, ingresosTotal,
    gastoGasolina, gastoComida, gastoHospedaje, gastoPeajes, gastoVehiculo, otrosGastos,
    gastosTotal, gananciaNeta, ingresoPromedioPorCarga, gananciaPorMilla,
  };
}

export interface MonthlySummary {
  mes: string;
  totalCargas: number;
  diasTrabajados: number;
  millasTotal: number;
  ingresosTotal: number;
  ingresoPromedioPorCarga: number;
  gananciaPorMilla: number;
  gastoGasolina: number;
  gastoComida: number;
  gastoHospedaje: number;
  gastoPeajes: number;
  gastoVehiculo: number;
  otrosGastos: number;
  gastosTotal: number;
  gananciaNeta: number;
}

export function computeMonthlySummary(
  cargas: Carga[],
  gasolina: RegistroGasolina[],
  peajes: RegistroPeaje[],
  yearMonth: string,
  gastosVehiculo: GastoVehiculo[] = []
): MonthlySummary {
  const mCargas = filterByMonth(cargas, yearMonth);
  const mGas = filterByMonth(gasolina, yearMonth);
  const mPeajes = filterByMonth(peajes, yearMonth);
  const mVeh = filterByMonth(gastosVehiculo, yearMonth);

  const totalCargas = mCargas.length;
  const uniqueDays = new Set(mCargas.map(c => c.fechaRecogida)).size;
  const millasTotal = mCargas.reduce((s, c) => s + c.millasTotal, 0);
  const ingresosTotal = mCargas.reduce((s, c) => s + c.pagoRecibido, 0);
  const unlinkedGas = mGas.filter(g => !g.cargaId);
  const gastoGasolinaFromLoads = mCargas.reduce((s, c) => {
    const linkedCost = mGas.filter(g => g.cargaId === c.id).reduce((a, g) => a + g.totalGasolina, 0);
    return s + (linkedCost > 0 ? linkedCost : (c.costoGasolina || 0));
  }, 0);
  const gastoGasolina = gastoGasolinaFromLoads + unlinkedGas.reduce((s, g) => s + g.totalGasolina, 0);
  const gastoComida = mCargas.reduce((s, c) => s + c.gastosComida, 0) + unlinkedGas.reduce((s, g) => s + g.snackComida, 0);
  const gastoHospedaje = mCargas.reduce((s, c) => s + c.hospedaje, 0);
  const gastoPeajes = mPeajes.reduce((s, p) => s + p.monto, 0);
  const gastoVehiculo = mVeh.reduce((s, v) => s + v.monto, 0);
  const otrosGastos = mCargas.reduce((s, c) => s + c.otrosGastos, 0);
  const gastosTotal = gastoGasolina + gastoComida + gastoHospedaje + gastoPeajes + gastoVehiculo + otrosGastos;
  const gananciaNeta = ingresosTotal - gastosTotal;
  const ingresoPromedioPorCarga = totalCargas > 0 ? ingresosTotal / totalCargas : 0;
  const gananciaPorMilla = millasTotal > 0 ? gananciaNeta / millasTotal : 0;

  return {
    mes: yearMonth, totalCargas, diasTrabajados: uniqueDays, millasTotal, ingresosTotal,
    ingresoPromedioPorCarga, gananciaPorMilla,
    gastoGasolina, gastoComida, gastoHospedaje, gastoPeajes, gastoVehiculo, otrosGastos,
    gastosTotal, gananciaNeta,
  };
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(n);
}

export function formatNumber(n: number, decimals = 1): string {
  return new Intl.NumberFormat("es-US", { maximumFractionDigits: decimals }).format(n);
}
