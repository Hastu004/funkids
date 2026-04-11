import { Routes } from '@angular/router';
import { BuyPage } from './buy-page';
import { FaqPage } from './faq-page';
import { HomePage } from './home-page';

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
    path: 'preguntas',
    component: FaqPage,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
