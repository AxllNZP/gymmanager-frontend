// ─── SINCRONIZADO CON PlanCreateRequest.java y PlanUpdateRequest.java ─────────
//
// El backend maneja dos operaciones distintas con contratos distintos:
//
//   CREAR:    PlanCreateRequest  → numeroPersonas, precio, descripcion
//             El nombre se genera automáticamente: 1→"Plan Individual", 2→"Plan Dúo", 3→"Plan Familiar"
//             Solo se permiten planes de 1, 2 o 3 personas (validado en backend)
//
//   EDITAR:   PlanUpdateRequest  → solo precio y descripcion
//             numeroPersonas y nombre son INMUTABLES después de crear
//
// PlanRequest (anterior) se marca deprecated para no romper nada en transición.
// ─────────────────────────────────────────────────────────────────────────────

/** Usado al crear un nuevo plan */
export interface PlanCreateRequest {
  numeroPersonas: number;   // solo 1, 2 o 3 — el backend valida esto
  precio:         number;
  descripcion?:   string;
  // nombre: NO se envía — el backend lo genera según numeroPersonas
}

/** Usado al editar un plan existente */
export interface PlanUpdateRequest {
  precio:       number;
  descripcion?: string;
  // nombre y numeroPersonas son inmutables — el backend los ignora si se envían
}

/** Respuesta del backend para ambas operaciones */
export interface PlanResponse {
  id:             number;
  nombre:         string;   // generado por el backend
  descripcion:    string;
  numeroPersonas: number;
  precio:         number;
  activo:         boolean;
  createdAt:      string;
  estructuraFija: boolean;  // siempre true — indica que nombre/personas son fijos
}

/**
 * @deprecated Usar PlanCreateRequest para crear y PlanUpdateRequest para editar.
 * Mantenido para no romper importaciones existentes durante la transición.
 */
export interface PlanRequest {
  nombre:         string;
  descripcion:    string;
  numeroPersonas: number;
  precio:         number;
}
