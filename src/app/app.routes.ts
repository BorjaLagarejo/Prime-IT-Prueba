import { Route } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './core/auth/auth.guard';

export const appRoutes: Route[] = [
  // Redirigir ruta vacía a '/inicio'
  { path: '', pathMatch: 'full', redirectTo: 'market-data' },
  {
    path: 'login',
    canMatch: [NoAuthGuard],
    loadChildren: () =>
      import('./modules/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    canMatch: [AuthGuard],
    children: [
      {
        path: 'market-data',
        loadChildren: () =>
          import('./modules/market-data/market-data.module').then(
            (m) => m.MarketDataModule
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'market-data' },
];
