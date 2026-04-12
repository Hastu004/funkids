import { Routes } from '@angular/router';
import { AdminPage } from './admin-page';
import { BuyPage } from './buy-page';
import { HomePage } from './home-page';
import { LegalPage } from './legal-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'comprar',
    component: BuyPage,
  },
  {
    path: 'bases-legales',
    component: LegalPage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
