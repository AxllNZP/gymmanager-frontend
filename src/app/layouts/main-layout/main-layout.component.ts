import { Component } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';

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
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  sidebarOpen = true;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: ['ADMIN', 'RECEPCIONISTA', 'CONTADOR', 'DUENO'],
      exact: true   // ← Evita que Dashboard quede activo en todas las rutas
    },
    {
      label: 'Clientes',
      icon: 'people',
      route: '/clientes',
      roles: ['ADMIN', 'RECEPCIONISTA'],
      exact: false
    },
    {
      label: 'Membresías',
      icon: 'card_membership',
      route: '/membresias',
      roles: ['ADMIN', 'RECEPCIONISTA'],
      exact: false
    },
    {
      label: 'Pagos',
      icon: 'payments',
      route: '/pagos',
      roles: ['ADMIN', 'RECEPCIONISTA', 'CONTADOR'],
      exact: false
    },
    {
      label: 'Asistencias',
      icon: 'how_to_reg',
      route: '/asistencias',
      roles: ['ADMIN', 'RECEPCIONISTA', 'DUENO'],
      exact: false
    },
    {
      label: 'Planes',
      icon: 'fitness_center',
      route: '/planes',
      roles: ['ADMIN'],
      exact: false
    },
    {
      label: 'Reportes',
      icon: 'bar_chart',
      route: '/reportes',
      roles: ['ADMIN', 'CONTADOR', 'DUENO'],
      exact: false
    },
    {
      label: 'Usuarios',
      icon: 'manage_accounts',
      route: '/usuarios',
      roles: ['ADMIN'],
      exact: false
    }
  ];

  constructor(public authService: AuthService) {}

  getVisibleItems(): NavItem[] {
    const role = this.authService.getRole();
    return this.navItems.filter(item => item.roles.includes(role));
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  confirmarLogout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
