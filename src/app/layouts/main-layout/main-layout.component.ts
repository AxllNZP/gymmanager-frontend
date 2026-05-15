import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { ConfirmService } from '../../core/services/confirm.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
  roles: string[];
  exact: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule,
    MatIconModule, MatButtonModule,
    MatListModule, MatMenuModule,
    MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {

  private readonly confirmService = inject(ConfirmService);
  readonly authService = inject(AuthService);

  sidebarOpen = true;

  // ─── ROLES SINCRONIZADOS CON EL BACKEND ──────────────────────────────────
  // ADMIN, RECEPCIONISTA, ENTRENADOR (antes CONTADOR), DUENO
  // Cada ítem solo aparece si el rol activo está en su lista 'roles'
  // ─────────────────────────────────────────────────────────────────────────
  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon:  'dashboard',
      route: '/dashboard',
      roles: ['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR', 'DUENO'],
      exact: true,
    },
    {
      label: 'Clientes',
      icon:  'people',
      route: '/clientes',
      roles: ['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR'],
      exact: false,
    },
    {
      label: 'Membresías',
      icon:  'card_membership',
      route: '/membresias',
      roles: ['ADMIN', 'RECEPCIONISTA'],
      exact: false,
    },
    {
      label: 'Pagos',
      icon:  'payments',
      route: '/pagos',
      roles: ['ADMIN', 'RECEPCIONISTA', 'DUENO'],
      exact: false,
    },
    {
      label: 'Asistencias',
      icon:  'how_to_reg',
      route: '/asistencias',
      roles: ['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR', 'DUENO'],
      exact: false,
    },
    {
      label: 'Planes',
      icon:  'fitness_center',
      route: '/planes',
      roles: ['ADMIN'],
      exact: false,
    },
    {
      label: 'Cupones',
      icon:  'local_offer',
      route: '/cupones',
      roles: ['ADMIN', 'DUENO'],
      exact: false,
    },
    {
      label: 'Reportes',
      icon:  'bar_chart',
      route: '/reportes',
      roles: ['ADMIN', 'DUENO', 'RECEPCIONISTA'],
      exact: false,
    },
    {
      label: 'Usuarios',
      icon:  'manage_accounts',
      route: '/usuarios',
      roles: ['ADMIN'],
      exact: false,
    },
  ];

  getVisibleItems(): NavItem[] {
    const role = this.authService.getRole();
    return this.navItems.filter(item => item.roles.includes(role));
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  confirmarLogout(): void {
    this.confirmService
      .warning(
        'Cerrar sesión',
        '¿Estás seguro de que deseas salir del sistema?',
        'Sí, salir'
      )
      .pipe(filter(Boolean))
      .subscribe(() => this.authService.logout());
  }
}
