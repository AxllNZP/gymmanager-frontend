// ─── SINCRONIZADO CON PagoRequest.java ───────────────────────────────────────
//
// CAMBIO PRINCIPAL:
//   ANTES: descuento (number) + motivoDescuento (string)  ← campos manuales
//   AHORA: cuponCodigo (string, opcional)                 ← lo que el backend espera
//
// El backend calcula internamente el descuento a partir del cupón.
// El frontend solo necesita pasar el código — la lógica de negocio vive en el servidor.
//
// PagoResponse también se completó con los campos de cupón que devuelve el backend
// pero que el frontend ignoraba (cuponCodigo, cuponDescripcion, cuponTipo).
// ─────────────────────────────────────────────────────────────────────────────

export interface PagoRequest {
  membresiaId:  number;
  clienteId:    number;
  metodoPago:   string;
  cuponCodigo?: string;   // opcional — solo si el cliente presenta un cupón
}

export interface PagoResponse {
  id:                    number;
  membresiaId:           number;
  clienteId:             number;
  clienteNombre:         string;
  clienteApellido:       string;
  planNombre:            string;
  montoOriginal:         number;   // precio base del plan sin descuento
  descuento:             number;   // calculado por el backend (0 si no hay cupón)
  monto:                 number;   // monto final cobrado
  motivoDescuento:       string;   // texto generado por el backend
  // ── Datos del cupón aplicado (null si no se usó cupón) ──
  cuponCodigo:           string | null;
  cuponDescripcion:      string | null;
  cuponTipo:             string | null;  // DESCUENTO_MONTO | DESCUENTO_PORCENTAJE | MESES_EXTRA
  // ── Resto de campos ──────────────────────────────────────
  metodoPago:            string;
  estado:                string;
  correoEnviado:         boolean;
  usuarioRegistroNombre: string;
  fechaPago:             string;
}
