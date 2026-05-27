import { Routes } from '@angular/router';

import { MainLayoutComponente } from './shell/main-layout-componente/main-layout-componente';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-componente/login-componente').then((m) => m.LoginComponente)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/auth/registro-componente/registro-componente').then(
        (m) => m.RegistroComponente
      )
  },
  {
    path: 'olvido-contrasenia',
    loadComponent: () =>
      import('./pages/auth/olvido-contrasenia-componente/olvido-contrasenia-componente').then(
        (m) => m.OlvidoContraseniaComponente
      )
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password-componente/reset-password-componente').then(
        (m) => m.ResetPasswordComponente
      )
  },
  {
    path: '',
    component: MainLayoutComponente,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-componente/dashboard-componente').then(
            (m) => m.DashboardComponente
          )
      },
      {
        path: 'ligas',
        loadChildren: () =>
          import('./features/leagues/routes/leagues.routes').then((m) => m.LEAGUES_ROUTES)
      },
      {
        path: 'principal',
        children: [
          {
            path: '',
            redirectTo: '/dashboard',
            pathMatch: 'full'
          },
          {
            path: 'ligas',
            loadChildren: () =>
              import('./features/leagues/routes/leagues.routes').then((m) => m.LEAGUES_ROUTES)
          }
        ]
      },
      {
        path: 'invitaciones',
        loadComponent: () =>
          import(
            './pages/invitaciones/enviar-invitacion-componente/enviar-invitacion-componente'
          ).then((m) => m.EnviarInvitacionComponente)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil-componente/perfil-componente').then(
            (m) => m.PerfilComponente
          )
      },
      {
        path: 'vaticinios',
        loadComponent: () =>
          import('./pages/vaticinios/vaticinio.component').then((m) => m.VaticinioComponent)
      },
      {
        path: 'clasificacion/liga/:idLiga',
        loadComponent: () =>
          import(
            './pages/clasificacion/clasificacion-liga-componente/clasificacion-liga-componente'
          ).then((m) => m.ClasificacionLigaComponente)
      },
      {
        path: 'admin/usuarios',
        loadComponent: () =>
          import('./pages/admin/usuarios-componente/usuarios-componente').then(
            (m) => m.UsuariosComponente
          )
      },
      {
        path: 'admin/dashboard-global',
        loadComponent: () =>
          import('./pages/admin/dashboard-global-componente/dashboard-global-componente').then(
            (m) => m.DashboardGlobalComponente
          )
      },
      {
        path: 'admin/auditoria',
        loadComponent: () =>
          import('./pages/admin/audit-log-componente/audit-log-componente').then(
            (m) => m.AuditLogComponente
          )
      },
      {
        path: 'admin/reportes',
        loadComponent: () =>
          import('./pages/admin/reportes-actividad-componente/reportes-actividad-componente').then(
            (m) => m.ReportesActividadComponente
          )
      },
      {
        path: 'admin/premios',
        loadComponent: () =>
          import('./pages/premios/ligas-premios-componente/ligas-premios-componente').then(
            (m) => m.LigasPremiosComponente
          )
      },
      {
        path: 'premios/liga/:id',
        loadComponent: () =>
          import('./pages/premios/premios-liga-componente/premios-liga-componente').then(
            (m) => m.PremiosLigaComponente
          )
      },
      {
        path: 'admin/mundial',
        loadComponent: () =>
          import(
            './pages/admin/mundial/admin-mundial-componente/admin-mundial-componente'
          ).then((m) => m.AdminMundialComponente)
      },
      {
        path: 'admin/mundial/sedes',
        loadComponent: () =>
          import(
            './pages/admin/mundial/sedes/sedes-lista-componente/sedes-lista-componente'
          ).then((m) => m.SedesListaComponente)
      },
      {
        path: 'admin/mundial/estadios',
        loadComponent: () =>
          import(
            './pages/admin/mundial/estadios/estadios-lista-componente/estadios-lista-componente'
          ).then((m) => m.EstadiosListaComponente)
      },
      {
        path: 'admin/mundial/paises',
        loadComponent: () =>
          import(
            './pages/admin/mundial/paises/paises-lista-componente/paises-lista-componente'
          ).then((m) => m.PaisesListaComponente)
      },
      {
        path: 'admin/mundial/grupos',
        loadComponent: () =>
          import(
            './pages/admin/mundial/grupos/grupos-lista-componente/grupos-lista-componente'
          ).then((m) => m.GruposListaComponente)
      },
      {
        path: 'admin/mundial/fases',
        loadComponent: () =>
          import(
            './pages/admin/mundial/fases/fases-lista-componente/fases-lista-componente'
          ).then((m) => m.FasesListaComponente)
      },
      {
        path: 'admin/mundial/partidos',
        loadComponent: () =>
          import(
            './pages/admin/mundial/partidos/partidos-lista-componente/partidos-lista-componente'
          ).then((m) => m.PartidosListaComponente)
      },
      {
        path: 'admin/mundial/bracket',
        loadComponent: () =>
          import(
            './pages/admin/mundial/partidos/bracket-componente/bracket-componente'
          ).then((m) => m.BracketComponente)
      },
      {
        path: 'admin/mundial/resultados',
        loadComponent: () =>
          import(
            './pages/admin/mundial/resultados/resultados-lista-componente/resultados-lista-componente'
          ).then((m) => m.ResultadosListaComponente)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
