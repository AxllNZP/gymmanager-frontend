import { Component, DestroyRef, inject } from '@angular/core';
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
// ← MatDialogModule y MatDialog eliminados — el Paso 5 los reintroduce
//   correctamente con un componente de confirmación real
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { ConfirmService } from '../../core/services/confirm.service';

interface NavItem {
  label: string;
  icon: string;
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
    // ← MatDialogModule eliminado
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {


  private readonly confirmService = inject(ConfirmService);
  readonly authService = inject(AuthService);
  // ← MatDialog eliminado del constructor

  sidebarOpen = true;

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon:  'dashboard',
      route: '/dashboard',
      roles: ['ADMIN', 'RECEPCIONISTA', 'CONTADOR', 'DUENO'],
      exact: true,
    },
    {
      label: 'Clientes',
      icon:  'people',
      route: '/clientes',
      roles: ['ADMIN', 'RECEPCIONISTA'],
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
      roles: ['ADMIN', 'RECEPCIONISTA', 'CONTADOR'],
      exact: false,
    },
    {
      label: 'Asistencias',
      icon:  'how_to_reg',
      route: '/asistencias',
      roles: ['ADMIN', 'RECEPCIONISTA', 'DUENO'],
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
      label: 'Reportes',
      icon:  'bar_chart',
      route: '/reportes',
      roles: ['ADMIN', 'CONTADOR', 'DUENO'],
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