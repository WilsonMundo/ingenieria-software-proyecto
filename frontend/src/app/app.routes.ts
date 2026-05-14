import { Routes } from '@angular/router';
import { LoginComponente } from './pages/login/login-componente/login-componente';
import { OlvidoContraseniaComponente } from './pages/auth/olvido-contrasenia-componente/olvido-contrasenia-componente';
import { RegistroComponente } from './pages/auth/registro-componente/registro-componente';
import { EnviarInvitacionComponente } from './pages/invitaciones/enviar-invitacion-componente/enviar-invitacion-componente';

export const routes: Routes = [
  { 
    path: 'login',
    component: LoginComponente 
  },
  { 
    path: 'olvido-contrasenia',
    component: OlvidoContraseniaComponente 
  },
  { 
    path: 'registro',
    component: RegistroComponente 
  },
  {
    path: 'invitaciones',
    component: EnviarInvitacionComponente
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
