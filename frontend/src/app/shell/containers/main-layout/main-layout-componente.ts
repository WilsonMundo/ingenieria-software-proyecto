import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-main-layout-componente',
  standalone: false,
  templateUrl: './main-layout-componente.html',
  styleUrl: './main-layout-componente.css'
})
export class MainLayoutComponente {
  notificationCount = 3;

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
