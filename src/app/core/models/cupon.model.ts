// ─── SINCRONIZADO CON CuponRequest.java y CuponResponse.java ─────────────────
//
// Tipos de descuento que soporta el backend (Cupon.TipoDescuento):
//
//   DESCUENTO_MONTO       → valorDescuento = monto fijo en soles (ej: 20.00)
//   DESCUENTO_PORCENTAJE  → valorDescuento = porcentaje entre 1 y 100 (ej: 15)
//   MESES_EXTRA           → mesesExtra = cuántos meses dura la membresía (mín: 2)
//                           en este tipo NO se reduce el precio
//
// REGLAS DE VALIDACIÓN DEL BACKEND (replicadas aquí para el formulario):
//   - DESCUENTO_MONTO:       valorDescuento obligatorio y > 0
//   - DESCUENTO_PORCENTAJE:  valorDescuento entre 1 y 100
//   - MESES_EXTRA:           mesesExtra mínimo 2, máximo 12
//   - Si fechaExpiracion está, debe ser posterior a fechaInicioValidez
// ─────────────────────────────────────────────────────────────────────────────

export type TipoDescuento =
  | 'DESCUENTO_MONTO'
  | 'DESCUENTO_PORCENTAJE'
  | 'MESES_EXTRA';

/** Payload para POST /api/cupones */
export interface CuponRequest {
  codigo:             string;         // 3-50 caracteres, se guarda en mayúsculas
  descripcion:        string;
  tipoDescuento:      TipoDescuento;
  valorDescuento?:    number;         // requerido para DESCUENTO_MONTO y DESCUENTO_PORCENTAJE
  mesesExtra?:        number;         // requerido para MESES_EXTRA (mín 2, máx 12)
  usoMaximo?:         number;         // null = ilimitado
  fechaInicioValidez?: string;        // ISO date 'YYYY-MM-DD', null = desde ya
  fechaExpiracion?:   string;         // ISO date 'YYYY-MM-DD', null = sin vencimiento
}

/** Respuesta del backend para GET /api/cupones y GET /api/cupones/{id} */
export interface CuponResponse {
  id:                 number;
  codigo:             string;
  descripcion:        string;
  tipoDescuento:      TipoDescuento;
  valorDescuento:     number | null;  // null para tipo MESES_EXTRA
  mesesExtra:         number | null;  // null para tipos de descuento monetario
  usoMaximo:          number | null;  // null = ilimitado
  usoActual:          number;
  usosDisponibles:    number | null;  // null si es ilimitado; calculado por el backend
  fechaInicioValidez: string | null;
  fechaExpiracion:    string | null;
  activo:             boolean;
  vigente:            boolean;        // calculado por el backend en el momento
  creadoPorNombre:    string;
  createdAt:          string;
}
