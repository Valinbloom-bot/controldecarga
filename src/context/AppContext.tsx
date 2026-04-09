import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppData, Carga, RegistroGasolina, RegistroPeaje, Meta, defaultAppData } from "@/types";

interface AppContextType {
  data: AppData;
  addCarga: (c: Omit<Carga, "id" | "millasTotal" | "totalGastos" | "gananciaNeta" | "gananciaPorMilla" | "ingresoPorMilla" | "createdAt">) => void;
  updateCarga: (c: Carga) => void;
  deleteCarga: (id: string) => void;
  addGasolina: (g: Omit<RegistroGasolina, "id" | "totalGasolina" | "totalGastado" | "createdAt">) => void;
  updateGasolina: (g: RegistroGasolina) => void;
  deleteGasolina: (id: string) => void;
  addPeaje: (p: Omit<RegistroPeaje, "id" | "createdAt">) => void;
  updatePeaje: (p: RegistroPeaje) => void;
  deletePeaje: (id: string) => void;
  setMeta: (m: Omit<Meta, "id">) => void;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function calcCarga(c: Omit<Carga, "millasTotal" | "totalGastos" | "gananciaNeta" | "gananciaPorMilla" | "ingresoPorMilla"> & Partial<Pick<Carga, "millasTotal" | "totalGastos" | "gananciaNeta" | "gananciaPorMilla" | "ingresoPorMilla">>): Carga {
  const millasTotal = (c.millasVacias || 0) + (c.millasCargadas || 0);
  const totalGastos = (c.costoGasolina || 0) + (c.gastosComida || 0) + (c.hospedaje || 0) + (c.otrosGastos || 0);
  const gananciaNeta = (c.pagoRecibido || 0) - totalGastos;
  const gananciaPorMilla = millasTotal > 0 ? gananciaNeta / millasTotal : 0;
  const ingresoPorMilla = millasTotal > 0 ? (c.pagoRecibido || 0) / millasTotal : 0;
  return { ...c, millasTotal, totalGastos, gananciaNeta, gananciaPorMilla, ingresoPorMilla } as Carga;
}

function calcGasolina(g: Omit<RegistroGasolina, "totalGasolina" | "totalGastado"> & Partial<Pick<RegistroGasolina, "totalGasolina" | "totalGastado">>): RegistroGasolina {
  const totalGasolina = (g.galones || 0) * (g.precioPorGalon || 0);
  const totalGastado = totalGasolina + (g.snackComida || 0);
  return { ...g, totalGasolina, totalGastado } as RegistroGasolina;
}

const STORAGE_KEY = "control-cargas-data";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultAppData, ...JSON.parse(raw) };
  } catch {}
  return defaultAppData;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.darkMode);
  }, [data.darkMode]);

  const uid = () => crypto.randomUUID();

  const addCarga = useCallback((c: any) => {
    setData(d => ({ ...d, cargas: [...d.cargas, calcCarga({ ...c, id: uid(), createdAt: new Date().toISOString() })] }));
  }, []);

  const updateCarga = useCallback((c: Carga) => {
    setData(d => ({ ...d, cargas: d.cargas.map(x => x.id === c.id ? calcCarga(c) : x) }));
  }, []);

  const deleteCarga = useCallback((id: string) => {
    setData(d => ({ ...d, cargas: d.cargas.filter(x => x.id !== id) }));
  }, []);

  const addGasolina = useCallback((g: any) => {
    setData(d => ({ ...d, gasolina: [...d.gasolina, calcGasolina({ ...g, id: uid(), createdAt: new Date().toISOString() })] }));
  }, []);

  const updateGasolina = useCallback((g: RegistroGasolina) => {
    setData(d => ({ ...d, gasolina: d.gasolina.map(x => x.id === g.id ? calcGasolina(g) : x) }));
  }, []);

  const deleteGasolina = useCallback((id: string) => {
    setData(d => ({ ...d, gasolina: d.gasolina.filter(x => x.id !== id) }));
  }, []);

  const addPeaje = useCallback((p: any) => {
    setData(d => ({ ...d, peajes: [...d.peajes, { ...p, id: uid(), createdAt: new Date().toISOString() }] }));
  }, []);

  const updatePeaje = useCallback((p: RegistroPeaje) => {
    setData(d => ({ ...d, peajes: d.peajes.map(x => x.id === p.id ? p : x) }));
  }, []);

  const deletePeaje = useCallback((id: string) => {
    setData(d => ({ ...d, peajes: d.peajes.filter(x => x.id !== id) }));
  }, []);

  const setMeta = useCallback((m: Omit<Meta, "id">) => {
    setData(d => {
      const existing = d.metas.findIndex(x => x.mes === m.mes);
      if (existing >= 0) {
        const updated = [...d.metas];
        updated[existing] = { ...m, id: updated[existing].id };
        return { ...d, metas: updated };
      }
      return { ...d, metas: [...d.metas, { ...m, id: uid() }] };
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setData(d => ({ ...d, darkMode: !d.darkMode }));
  }, []);

  return (
    <AppContext.Provider value={{ data, addCarga, updateCarga, deleteCarga, addGasolina, updateGasolina, deleteGasolina, addPeaje, updatePeaje, deletePeaje, setMeta, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
}
