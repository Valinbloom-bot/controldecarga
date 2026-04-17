import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppData, Carga, RegistroGasolina, RegistroPeaje, GastoVehiculo, Meta, defaultAppData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AppContextType {
  data: AppData;
  loading: boolean;
  addCarga: (c: Omit<Carga, "id" | "millasTotal" | "totalGastos" | "gananciaNeta" | "gananciaPorMilla" | "ingresoPorMilla" | "createdAt">) => Promise<void>;
  updateCarga: (c: Carga) => Promise<void>;
  deleteCarga: (id: string) => Promise<void>;
  addGasolina: (g: Omit<RegistroGasolina, "id" | "totalGasolina" | "totalGastado" | "createdAt">) => Promise<void>;
  updateGasolina: (g: RegistroGasolina) => Promise<void>;
  deleteGasolina: (id: string) => Promise<void>;
  addPeaje: (p: Omit<RegistroPeaje, "id" | "createdAt">) => Promise<void>;
  updatePeaje: (p: RegistroPeaje) => Promise<void>;
  deletePeaje: (id: string) => Promise<void>;
  addGastoVehiculo: (g: Omit<GastoVehiculo, "id" | "createdAt">) => Promise<void>;
  updateGastoVehiculo: (g: GastoVehiculo) => Promise<void>;
  deleteGastoVehiculo: (id: string) => Promise<void>;
  setMeta: (m: Omit<Meta, "id">) => Promise<void>;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DARK_KEY = "control-cargas-dark";

// ---------- mappers ----------
function rowToCarga(r: any): Carga {
  const millasVacias = Number(r.millas_vacias) || 0;
  const millasCargadas = Number(r.millas_cargadas) || 0;
  const millasTotal = millasVacias + millasCargadas;
  const pagoRecibido = Number(r.pago_recibido) || 0;
  const costoGasolina = Number(r.costo_gasolina) || 0;
  return {
    id: r.id,
    fechaRecogida: r.fecha_recogida ?? "",
    horaRecogida: r.hora_recogida ?? "",
    ubicacionRecogida: r.ubicacion_recogida ?? "",
    fechaEntrega: r.fecha_entrega ?? "",
    horaEntrega: r.hora_entrega ?? "",
    ubicacionEntrega: r.ubicacion_entrega ?? "",
    millasVacias,
    millasCargadas,
    millasTotal,
    pagoRecibido,
    costoGasolina,
    gastosComida: Number(r.gastos_comida) || 0,
    hospedaje: Number(r.hospedaje) || 0,
    otrosGastos: Number(r.otros_gastos) || 0,
    totalGastos: 0, // recalculated below
    gananciaNeta: 0,
    gananciaPorMilla: 0,
    ingresoPorMilla: 0,
    notas: r.notas ?? "",
    createdAt: r.created_at,
  };
}

function cargaToRow(c: Partial<Carga>, userId: string) {
  return {
    user_id: userId,
    fecha_recogida: c.fechaRecogida,
    hora_recogida: c.horaRecogida,
    ubicacion_recogida: c.ubicacionRecogida,
    fecha_entrega: c.fechaEntrega,
    hora_entrega: c.horaEntrega,
    ubicacion_entrega: c.ubicacionEntrega,
    millas_vacias: c.millasVacias ?? 0,
    millas_cargadas: c.millasCargadas ?? 0,
    pago_recibido: c.pagoRecibido ?? 0,
    costo_gasolina: c.costoGasolina ?? 0,
    gastos_comida: c.gastosComida ?? 0,
    hospedaje: c.hospedaje ?? 0,
    otros_gastos: c.otrosGastos ?? 0,
    notas: c.notas ?? "",
  };
}

function rowToGas(r: any): RegistroGasolina {
  const galones = Number(r.galones) || 0;
  const precioPorGalon = Number(r.precio_por_galon) || 0;
  const totalGasolina = galones * precioPorGalon;
  const snackComida = Number(r.snack_comida) || 0;
  return {
    id: r.id,
    fecha: r.fecha ?? "",
    hora: r.hora ?? "",
    gasolinera: r.gasolinera ?? "",
    ubicacion: r.ubicacion ?? "",
    galones,
    precioPorGalon,
    totalGasolina,
    snackComida,
    totalGastado: totalGasolina + snackComida,
    metodoPago: r.metodo_pago ?? "",
    notas: r.notas ?? "",
    cargaId: r.carga_id ?? undefined,
    createdAt: r.created_at,
  };
}

function gasToRow(g: Partial<RegistroGasolina>, userId: string) {
  return {
    user_id: userId,
    carga_id: g.cargaId ?? null,
    fecha: g.fecha,
    hora: g.hora ?? null,
    gasolinera: g.gasolinera,
    ubicacion: g.ubicacion,
    galones: g.galones ?? 0,
    precio_por_galon: g.precioPorGalon ?? 0,
    snack_comida: g.snackComida ?? 0,
    metodo_pago: g.metodoPago,
    notas: g.notas ?? "",
  };
}

function rowToPeaje(r: any): RegistroPeaje {
  return {
    id: r.id,
    fecha: r.fecha ?? "",
    ubicacionCarretera: r.ubicacion_carretera ?? "",
    monto: Number(r.monto) || 0,
    metodoPago: r.metodo_pago ?? "",
    notas: r.notas ?? "",
    createdAt: r.created_at,
  };
}

function peajeToRow(p: Partial<RegistroPeaje>, userId: string) {
  return {
    user_id: userId,
    fecha: p.fecha,
    ubicacion_carretera: p.ubicacionCarretera,
    monto: p.monto ?? 0,
    metodo_pago: p.metodoPago,
    notas: p.notas ?? "",
  };
}

function rowToGastoVehiculo(r: any): GastoVehiculo {
  return {
    id: r.id,
    fecha: r.fecha ?? "",
    categoria: r.categoria ?? "",
    descripcion: r.descripcion ?? "",
    monto: Number(r.monto) || 0,
    notas: r.notas ?? "",
    createdAt: r.created_at,
  };
}

function gastoVehiculoToRow(g: Partial<GastoVehiculo>, userId: string) {
  return {
    user_id: userId,
    fecha: g.fecha,
    categoria: g.categoria,
    descripcion: g.descripcion,
    monto: g.monto ?? 0,
    notas: g.notas ?? "",
  };
}

function rowToMeta(r: any): Meta {
  return {
    id: r.id,
    mes: r.mes,
    metaCargas: Number(r.meta_cargas) || 0,
    metaIngreso: Number(r.meta_ingreso) || 0,
    metaMillas: Number(r.meta_millas) || 0,
    metaGananciaNeta: Number(r.meta_ganancia_neta) || 0,
  };
}

// ---------- calculation helpers ----------
function applyCalcs(cargas: Carga[], gasolina: RegistroGasolina[]): Carga[] {
  return cargas.map((c) => {
    const linkedCost = gasolina
      .filter((g) => g.cargaId === c.id)
      .reduce((s, g) => s + g.totalGasolina, 0);
    const gasolinaCost = linkedCost > 0 ? linkedCost : c.costoGasolina || 0;
    const totalGastos = gasolinaCost + (c.gastosComida || 0) + (c.hospedaje || 0) + (c.otrosGastos || 0);
    const gananciaNeta = (c.pagoRecibido || 0) - totalGastos;
    const gananciaPorMilla = c.millasTotal > 0 ? gananciaNeta / c.millasTotal : 0;
    const ingresoPorMilla = c.millasTotal > 0 ? (c.pagoRecibido || 0) / c.millasTotal : 0;
    return { ...c, totalGastos, gananciaNeta, gananciaPorMilla, ingresoPorMilla };
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(() => ({
    ...defaultAppData,
    darkMode: localStorage.getItem(DARK_KEY) === "1",
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.darkMode);
    localStorage.setItem(DARK_KEY, data.darkMode ? "1" : "0");
  }, [data.darkMode]);

  // Load all data when user changes
  useEffect(() => {
    if (!user) {
      setData((d) => ({ ...defaultAppData, darkMode: d.darkMode }));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [{ data: cR }, { data: gR }, { data: pR }, { data: mR }] = await Promise.all([
        supabase.from("cargas").select("*").order("created_at", { ascending: false }),
        supabase.from("gasolina").select("*").order("created_at", { ascending: false }),
        supabase.from("peajes").select("*").order("created_at", { ascending: false }),
        supabase.from("metas").select("*"),
      ]);
      if (cancelled) return;
      const gasolina = (gR ?? []).map(rowToGas);
      const cargas = applyCalcs((cR ?? []).map(rowToCarga), gasolina);
      setData((d) => ({
        ...d,
        cargas,
        gasolina,
        peajes: (pR ?? []).map(rowToPeaje),
        metas: (mR ?? []).map(rowToMeta),
      }));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const refreshCargas = useCallback((cargas: Carga[], gasolina: RegistroGasolina[]) => {
    setData((d) => ({ ...d, cargas: applyCalcs(cargas, gasolina), gasolina }));
  }, []);

  // ---------- CARGAS ----------
  const addCarga = useCallback(async (c: any) => {
    if (!user) return;
    const { data: row, error } = await supabase
      .from("cargas")
      .insert(cargaToRow(c, user.id))
      .select()
      .single();
    if (error || !row) return;
    setData((d) => {
      const newCargas = [rowToCarga(row), ...d.cargas];
      return { ...d, cargas: applyCalcs(newCargas, d.gasolina) };
    });
  }, [user]);

  const updateCarga = useCallback(async (c: Carga) => {
    if (!user) return;
    const { error } = await supabase.from("cargas").update(cargaToRow(c, user.id)).eq("id", c.id);
    if (error) return;
    setData((d) => {
      const newCargas = d.cargas.map((x) => (x.id === c.id ? { ...rowToCarga({ ...cargaToRow(c, user.id), id: c.id, created_at: c.createdAt }) } : x));
      return { ...d, cargas: applyCalcs(newCargas, d.gasolina) };
    });
  }, [user]);

  const deleteCarga = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("cargas").delete().eq("id", id);
    if (error) return;
    setData((d) => {
      const newGas = d.gasolina.map((g) => (g.cargaId === id ? { ...g, cargaId: undefined } : g));
      const newCargas = d.cargas.filter((x) => x.id !== id);
      return { ...d, cargas: applyCalcs(newCargas, newGas), gasolina: newGas };
    });
  }, [user]);

  // ---------- GASOLINA ----------
  const addGasolina = useCallback(async (g: any) => {
    if (!user) return;
    const { data: row, error } = await supabase
      .from("gasolina")
      .insert(gasToRow(g, user.id))
      .select()
      .single();
    if (error || !row) return;
    setData((d) => {
      const newGas = [rowToGas(row), ...d.gasolina];
      return { ...d, gasolina: newGas, cargas: applyCalcs(d.cargas, newGas) };
    });
  }, [user]);

  const updateGasolina = useCallback(async (g: RegistroGasolina) => {
    if (!user) return;
    const { error } = await supabase.from("gasolina").update(gasToRow(g, user.id)).eq("id", g.id);
    if (error) return;
    setData((d) => {
      const newGas = d.gasolina.map((x) => (x.id === g.id ? rowToGas({ ...gasToRow(g, user.id), id: g.id, created_at: g.createdAt }) : x));
      return { ...d, gasolina: newGas, cargas: applyCalcs(d.cargas, newGas) };
    });
  }, [user]);

  const deleteGasolina = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("gasolina").delete().eq("id", id);
    if (error) return;
    setData((d) => {
      const newGas = d.gasolina.filter((x) => x.id !== id);
      return { ...d, gasolina: newGas, cargas: applyCalcs(d.cargas, newGas) };
    });
  }, [user]);

  // ---------- PEAJES ----------
  const addPeaje = useCallback(async (p: any) => {
    if (!user) return;
    const { data: row, error } = await supabase
      .from("peajes")
      .insert(peajeToRow(p, user.id))
      .select()
      .single();
    if (error || !row) return;
    setData((d) => ({ ...d, peajes: [rowToPeaje(row), ...d.peajes] }));
  }, [user]);

  const updatePeaje = useCallback(async (p: RegistroPeaje) => {
    if (!user) return;
    const { error } = await supabase.from("peajes").update(peajeToRow(p, user.id)).eq("id", p.id);
    if (error) return;
    setData((d) => ({ ...d, peajes: d.peajes.map((x) => (x.id === p.id ? p : x)) }));
  }, [user]);

  const deletePeaje = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("peajes").delete().eq("id", id);
    if (error) return;
    setData((d) => ({ ...d, peajes: d.peajes.filter((x) => x.id !== id) }));
  }, [user]);

  // ---------- METAS ----------
  const setMeta = useCallback(async (m: Omit<Meta, "id">) => {
    if (!user) return;
    const { data: row, error } = await supabase
      .from("metas")
      .upsert(
        {
          user_id: user.id,
          mes: m.mes,
          meta_cargas: m.metaCargas,
          meta_ingreso: m.metaIngreso,
          meta_millas: m.metaMillas,
          meta_ganancia_neta: m.metaGananciaNeta,
        },
        { onConflict: "user_id,mes" }
      )
      .select()
      .single();
    if (error || !row) return;
    setData((d) => {
      const idx = d.metas.findIndex((x) => x.mes === m.mes);
      const newMeta = rowToMeta(row);
      const metas = idx >= 0 ? d.metas.map((x, i) => (i === idx ? newMeta : x)) : [...d.metas, newMeta];
      return { ...d, metas };
    });
  }, [user]);

  const toggleDarkMode = useCallback(() => {
    setData((d) => ({ ...d, darkMode: !d.darkMode }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        addCarga,
        updateCarga,
        deleteCarga,
        addGasolina,
        updateGasolina,
        deleteGasolina,
        addPeaje,
        updatePeaje,
        deletePeaje,
        setMeta,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
}
