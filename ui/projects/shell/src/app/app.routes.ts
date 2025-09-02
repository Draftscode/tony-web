import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'app',
}, {
    path: 'auth',
    children: [{
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    }, {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login')
    }]
}, {
    // canActivate: [authGuard],
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/authorized/app/app'),
    children: [{
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/app/form/empty.component'),
    }, {
        path: ':id',
        loadComponent: () => import('./features/app/form/form.component'),
    }],
}, {
    path: '**',
    redirectTo: '/'
}];
