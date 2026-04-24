export interface Carga {
  id: string;
  fechaRecogida: string;
  horaRecogida: string; // check-in time at pickup
  horaSalidaRecogida?: string; // check-out time at pickup
  ubicacionRecogida: string;
  fechaEntrega: string;
  horaEntrega: string; // check-in time at delivery
  horaSalidaEntrega?: string; // check-out time at delivery
  ubicacionEntrega: string;
  millasVacias: number;
  millasCargadas: number;
  millasTotal: number; // auto
  pagoRecibido: number;
  costoGasolina: number;
  gastosComida: number;
  hospedaje: number;
  otrosGastos: number;
  totalGastos: number; // auto
  gananciaNeta: number; // auto
  gananciaPorMilla: number; // auto
  ingresoPorMilla: number; // auto
  notas: string;
  createdAt: string;
}

export interface RegistroGasolina {
  id: string;
  fecha: string;
  hora: string;
  gasolinera: string;
  ubicacion: string;
  galones: number;
  precioPorGalon: number;
  totalGasolina: number; // auto
  snackComida: number;
  totalGastado: number; // auto
  metodoPago: string;
  notas: string;
  cargaId?: string; // optional link to a load
  createdAt: string;
}

export interface RegistroPeaje {
  id: string;
  fecha: string;
  ubicacionCarretera: string;
  monto: number;
  metodoPago: string;
  notas: string;
  createdAt: string;
}

export interface GastoVehiculo {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  notas: string;
  createdAt: string;
}

export const CATEGORIAS_GASTO_VEHICULO = [
  "Mantenimiento",
  "Llantas",
  "Seguro",
  "Registro/Permisos",
  "Reparaciones",
  "Pago del Vehículo",
  "Otros",
] as const;

export interface Meta {
  id: string;
  metaCargas: number;
  metaIngreso: number;
  metaMillas: number;
  metaGananciaNeta: number;
  mes: string; // YYYY-MM
}

export interface AppData {
  cargas: Carga[];
  gasolina: RegistroGasolina[];
  peajes: RegistroPeaje[];
  gastosVehiculo: GastoVehiculo[];
  metas: Meta[];
  darkMode: boolean;
}

export const defaultAppData: AppData = {
  cargas: [],
  gasolina: [],
  peajes: [],
  gastosVehiculo: [],
  metas: [],
  darkMode: false,
};
