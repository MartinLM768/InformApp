import { Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    // home ahora muestra la identidad corporativa
    path: 'home',
    loadComponent: () => import('./pages/identidad/identidad.page').then((m) => m.IdentidadPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then((m) => m.AdminPage),
    canActivate: [AdminGuard],
  },
  {
    // políticos: lista con filtro inteligente (antes era home)
    path: 'politicos',
    loadComponent: () => import('./pages/politicos/politicos.page').then((m) => m.PoliticosPage),
  },
  {
    // partidos: nueva pestaña
    path: 'partidos',
    loadComponent: () => import('./pages/partidos/partidos.page').then((m) => m.PartidosPage),
  },
  {
    path: 'candidatos',
    loadComponent: () => import('./pages/candidatos/candidatos.page').then((m) => m.CandidatosPage),
  },
];