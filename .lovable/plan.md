## Múltiples paradas por carga

Permitir que una carga tenga varias recogidas y varias entregas en secuencia, manteniendo intacto el resto del modelo.

### Modelo de datos

Agregar una columna `paradas` (JSONB) a la tabla `cargas`, opcional, con un arreglo ordenado:

```text
paradas: [
  { tipo: "recogida" | "entrega",
    fecha, hora, horaSalida, ubicacion, notas }
]
```

- El orden del arreglo = la secuencia de paradas que verá el conductor.
- Los campos actuales (`ubicacion_recogida`, `fecha_recogida`, `hora_recogida`, `ubicacion_entrega`, `fecha_entrega`, `hora_entrega`, etc.) se conservan y se sincronizan con la **primera recogida** y la **última entrega**, para no romper:
  - listas existentes
  - cálculos (millas, ganancias, gasolina vinculada)
  - exportaciones CSV/PDF
  - cargas antiguas sin `paradas`

Sin migración de datos antigua: cargas previas seguirán mostrándose tal cual (una recogida + una entrega).

### Tipos (`src/types/index.ts`)

Agregar:

```ts
export interface Parada {
  tipo: "recogida" | "entrega";
  fecha: string;
  hora: string;
  horaSalida?: string;
  ubicacion: string;
  notas?: string;
}
```

Agregar `paradas?: Parada[]` a `Carga`.

### Mapper (`AppContext.tsx`)

- `rowToCarga`: leer `r.paradas` si existe.
- `cargaToRow`: incluir `paradas: c.paradas ?? null` y sincronizar la primera recogida / última entrega en los campos existentes antes de guardar.

### Formulario (`src/pages/RegistroCarga.tsx`)

Reemplazar las dos secciones fijas "Recogida" y "Entrega" por:

- **Recogidas** (lista, mínimo 1)
  - Cada item: ubicación, fecha, check-in (+ TZ), check-out (+ TZ), notas
  - Botón "Agregar recogida" abajo
  - Botón eliminar por parada (deshabilitado si solo queda 1)
- **Entregas** (lista, mínimo 1) — misma estructura
- Header de cada parada: `Recogida 1`, `Recogida 2`, `Entrega 1`… para indicar secuencia
- Botones ↑ ↓ para reordenar dentro del mismo tipo

El resto del formulario (millas, pago, pernocta, extras opcionales, etc.) no cambia. Validación: al menos 1 recogida y 1 entrega completas (ubicación + fecha + hora check-in).

Al guardar:
- `paradas` = recogidas seguidas de entregas, en el orden de la UI
- `ubicacionRecogida/fechaRecogida/horaRecogida/horaSalidaRecogida` ← primera recogida
- `ubicacionEntrega/fechaEntrega/horaEntrega/horaSalidaEntrega` ← última entrega

Al abrir en modo edición: si la carga tiene `paradas`, se hidratan; si no, se construye una recogida y una entrega desde los campos planos existentes.

### Vista de lista (item expandido en `RegistroCarga.tsx`)

Si la carga tiene `paradas` con más de 2, mostrar bloque "Ruta" con la secuencia numerada (Recogida 1 → Recogida 2 → Entrega 1 → Entrega 2), cada una con su ubicación, fecha y hora. Cargas sin `paradas` o con exactamente 1+1 mantienen la vista actual.

### Fuera de alcance

- Exportaciones CSV/PDF siguen mostrando solo origen y destino (primera recogida / última entrega). Se puede ampliar después si se pide.
- Sin cambios en gasolina, peajes, metas, dashboard.

### Archivos a tocar

- `supabase/migrations/...` — `ALTER TABLE cargas ADD COLUMN paradas jsonb`
- `src/types/index.ts`
- `src/context/AppContext.tsx` (mappers)
- `src/pages/RegistroCarga.tsx` (formulario + vista lista)
