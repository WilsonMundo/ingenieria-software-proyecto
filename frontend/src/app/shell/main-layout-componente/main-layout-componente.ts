import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth-service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-main-layout-componente',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './main-layout-componente.html',
  styleUrl: './main-layout-componente.css'
})
export class MainLayoutComponente implements OnInit {
  usuario: any = null;

  readonly mainMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', exact: true },
    { label: 'Ligas', icon: 'groups', route: '/principal/ligas' },
    { label: 'Vaticinios', icon: 'track_changes', route: '/vaticinios' },
    { label: 'Rankings', icon: 'workspace_premium', route: '/clasificacion/liga/1' },
    { label: 'Invitaciones', icon: 'mail', route: '/invitaciones' },
    { label: 'Perfil', icon: 'person', route: '/perfil' },
    { label: 'Premios', icon: 'emoji_events', route: '/admin/premios' }
  ];

  readonly adminMenu: MenuItem[] = [
    { label: 'Usuarios', icon: 'manage_accounts', route: '/admin/usuarios' },
    { label: 'Panel global', icon: 'admin_panel_settings', route: '/admin/dashboard-global' },
    { label: 'Auditoria', icon: 'fact_check', route: '/admin/auditoria' },
    { label: 'Reportes', icon: 'assessment', route: '/admin/reportes' }
  ];

  readonly mundialMenu: MenuItem[] = [
    { label: 'Mundial', icon: 'public', route: '/admin/mundial', exact: true },
    { label: 'Sedes', icon: 'location_city', route: '/admin/mundial/sedes' },
    { label: 'Estadios', icon: 'stadium', route: '/admin/mundial/estadios' },
    { label: 'Paises', icon: 'flag', route: '/admin/mundial/paises' },
    { label: 'Grupos', icon: 'groups', route: '/admin/mundial/grupos' },
    { label: 'Fases', icon: 'layers', route: '/admin/mundial/fases' },
    { label: 'Partidos', icon: 'sports_soccer', route: '/admin/mundial/partidos' },
    { label: 'Bracket', icon: 'account_tree', route: '/admin/mundial/bracket' },
    { label: 'Resultados', icon: 'scoreboard', route: '/admin/mundial/resultados' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = this.authService.obtenerUsuario();
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.finalizarSesion(),
      error: () => this.finalizarSesion()
    });
  }

  private finalizarSesion(): void {
    this.authService.limpiarSesion();
    this.router.navigate(['/login']);
  }
}
