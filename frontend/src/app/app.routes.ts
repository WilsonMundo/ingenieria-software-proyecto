import { Routes } from '@angular/router';

import { LoginComponente } from './pages/login/login-componente/login-componente';
import { RegistroComponente } from './pages/auth/registro-componente/registro-componente';
import { OlvidoContraseniaComponente } from './pages/auth/olvido-contrasenia-componente/olvido-contrasenia-componente';
import { EnviarInvitacionComponente } from './pages/invitaciones/enviar-invitacion-componente/enviar-invitacion-componente';
import { PerfilComponente } from './pages/perfil/perfil-componente/perfil-componente';
import { DashboardComponente } from './pages/dashboard/dashboard-componente/dashboard-componente';
import { UsuariosComponente } from './pages/admin/usuarios-componente/usuarios-componente';

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
    path: 'dashboard',
    component: DashboardComponente  
  },
  {
    path: 'admin/usuarios',
    component: UsuariosComponente
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  },
  { path: 'admin/mundial',            component: AdminMundialComponente },
  { path: 'admin/mundial/sedes',      component: SedesListaComponente },
  { path: 'admin/mundial/estadios',   component: EstadiosListaComponente },
  { path: 'admin/mundial/paises',     component: PaisesListaComponente },
  { path: 'admin/mundial/grupos',     component: GruposListaComponente },
  { path: 'admin/mundial/fases',      component: FasesListaComponente },
  { path: 'admin/mundial/partidos',   component: PartidosListaComponente },
  { path: 'admin/mundial/bracket',    component: BracketComponente },
  { path: 'admin/mundial/resultados', component: ResultadosListaComponente }
];
