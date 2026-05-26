import { Routes } from '@angular/router';

import { LoginComponente } from './pages/login/login-componente/login-componente';
import { RegistroComponente } from './pages/auth/registro-componente/registro-componente';
import { OlvidoContraseniaComponente } from './pages/auth/olvido-contrasenia-componente/olvido-contrasenia-componente';
import { EnviarInvitacionComponente } from './pages/invitaciones/enviar-invitacion-componente/enviar-invitacion-componente';
import { PerfilComponente } from './pages/perfil/perfil-componente/perfil-componente';
import { DashboardComponente } from './pages/dashboard/dashboard-componente/dashboard-componente';
import { UsuariosComponente } from './pages/admin/usuarios-componente/usuarios-componente';
import { ResetPasswordComponente } from './pages/auth/reset-password-componente/reset-password-componente';

// ── M5: Administración del Mundial ──────────────────────────────────────────
import { AdminMundialComponente } from './pages/admin/mundial/admin-mundial-componente/admin-mundial-componente';
import { SedesListaComponente } from './pages/admin/mundial/sedes/sedes-lista-componente/sedes-lista-componente';
import { EstadiosListaComponente } from './pages/admin/mundial/estadios/estadios-lista-componente/estadios-lista-componente';
import { PaisesListaComponente } from './pages/admin/mundial/paises/paises-lista-componente/paises-lista-componente';
import { GruposListaComponente } from './pages/admin/mundial/grupos/grupos-lista-componente/grupos-lista-componente';
import { FasesListaComponente } from './pages/admin/mundial/fases/fases-lista-componente/fases-lista-componente';
import { PartidosListaComponente } from './pages/admin/mundial/partidos/partidos-lista-componente/partidos-lista-componente';
import { BracketComponente } from './pages/admin/mundial/partidos/bracket-componente/bracket-componente';
import { ResultadosListaComponente } from './pages/admin/mundial/resultados/resultados-lista-componente/resultados-lista-componente';

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
     path: 'reset-password',
      component: ResetPasswordComponente
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

  // Redirecciones
  { path: '',   redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
