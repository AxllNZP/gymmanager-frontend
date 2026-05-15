import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CuponRequest, CuponResponse } from '../models/cupon.model';
import { environment } from '../../../environments/environment';

// ─── ENDPOINTS DISPONIBLES EN CuponController.java ───────────────────────────
//
//   POST   /api/cupones                      → crear (ADMIN, DUENO)
//   GET    /api/cupones                      → listar todos (ADMIN, DUENO)
//   GET    /api/cupones/vigentes             → solo vigentes (ADMIN, DUENO, RECEPCIONISTA)
//   GET    /api/cupones/{id}                 → por id (ADMIN, DUENO)
//   GET    /api/cupones/codigo/{codigo}      → por código (ADMIN, DUENO, RECEPCIONISTA)
//   PATCH  /api/cupones/{id}/desactivar     → desactivar (ADMIN, DUENO)
//   PATCH  /api/cupones/{id}/activar        → activar (ADMIN, DUENO)
//
// El endpoint de verificación por código es útil para que el recepcionista
// consulte si un cupón es válido antes de aplicarlo en un pago.
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CuponService {

  private baseUrl = `${environment.apiUrl}/cupones`;

  constructor(private http: HttpClient) {}

  /** Lista todos los cupones — solo ADMIN y DUENO */
  listarTodos(): Observable<ApiResponse<CuponResponse[]>> {
    return this.http.get<ApiResponse<CuponResponse[]>>(this.baseUrl);
  }

  /** Lista solo cupones vigentes — ADMIN, DUENO y RECEPCIONISTA */
  listarVigentes(): Observable<ApiResponse<CuponResponse[]>> {
    return this.http.get<ApiResponse<CuponResponse[]>>(`${this.baseUrl}/vigentes`);
  }

  /** Obtiene un cupón por su id */
  obtenerPorId(id: number): Observable<ApiResponse<CuponResponse>> {
    return this.http.get<ApiResponse<CuponResponse>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Verifica si un código de cupón existe y es vigente.
   * Útil para mostrar feedback al recepcionista antes de registrar el pago.
   * El backend lanza 404 si no existe.
   */
  verificarCodigo(codigo: string): Observable<ApiResponse<CuponResponse>> {
    return this.http.get<ApiResponse<CuponResponse>>(
      `${this.baseUrl}/codigo/${codigo.toUpperCase()}`
    );
  }

  /** Crea un nuevo cupón — el backend genera el código en mayúsculas */
  crear(request: CuponRequest): Observable<ApiResponse<CuponResponse>> {
    return this.http.post<ApiResponse<CuponResponse>>(this.baseUrl, request);
  }

  /** Desactiva un cupón sin eliminarlo */
  desactivar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/${id}/desactivar`, {}
    );
  }

  /** Reactiva un cupón desactivado */
  activar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/${id}/activar`, {}
    );
  }
}
