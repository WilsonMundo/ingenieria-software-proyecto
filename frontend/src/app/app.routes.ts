import { Routes } from '@angular/router';

import { LoginComponente } from './pages/login/login-componente/login-componente';
import { RegistroComponente } from './pages/auth/registro-componente/registro-componente';
import { OlvidoContraseniaComponente } from './pages/auth/olvido-contrasenia-componente/olvido-contrasenia-componente';
import { EnviarInvitacionComponente } from './pages/invitaciones/enviar-invitacion-componente/enviar-invitacion-componente';
import { PerfilComponente } from './pages/perfil/perfil-componente/perfil-componente';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponente
  },
  {
    path: 'registro',
    component: RegistroComponente
  },
  {
    path: 'olvido-contrasenia',
    component: OlvidoContraseniaComponente
  },
  {
    path: 'invitaciones',
    component: EnviarInvitacionComponente
  },
  {
    path: 'perfil',
    component: PerfilComponente
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];