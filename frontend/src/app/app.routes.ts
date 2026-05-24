import { Routes } from '@angular/router';

import { LoginComponente } from './pages/login/login-componente/login-componente';
import { RegistroComponente } from './pages/auth/registro-componente/registro-componente';
import { OlvidoContraseniaComponente } from './pages/auth/olvido-contrasenia-componente/olvido-contrasenia-componente';
import { EnviarInvitacionComponente } from './pages/invitaciones/enviar-invitacion-componente/enviar-invitacion-componente';
import { PerfilComponente } from './pages/perfil/perfil-componente/perfil-componente';
import { DashboardComponente } from './pages/dashboard/dashboard-componente/dashboard-componente';
import { UsuariosComponente } from './pages/admin/usuarios-componente/usuarios-componente';
import { DashboardGlobalComponente } from './pages/admin/dashboard-global-componente/dashboard-global-componente';
import { AuditLogComponente } from './pages/admin/audit-log-componente/audit-log-componente';
import { ReportesActividadComponente } from './pages/admin/reportes-actividad-componente/reportes-actividad-componente';
import { LigasPremiosComponente } from './pages/premios/ligas-premios-componente/ligas-premios-componente';
import { PremiosLigaComponente } from './pages/premios/premios-liga-componente/premios-liga-componente';

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
    path: 'admin/dashboard-global',
    component: DashboardGlobalComponente
  },
  {
    path: 'admin/auditoria',
    component: AuditLogComponente
  },
  {
    path: 'admin/reportes',
    component: ReportesActividadComponente
  },
  {
    path: 'admin/premios',
    component: LigasPremiosComponente
  },
  {
    path: 'premios/liga/:id',
    component: PremiosLigaComponente
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