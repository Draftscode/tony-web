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
    loadComponent: () => import('./features/authorized/app/app-authorized'),
    children: [{
        path: '',
        pathMatch: 'full',
        redirectTo: 'files'
    }, {
        path: 'files',
        children: [{
            path: '',
            loadComponent: () => import('./features/authorized/form/list/file-list')
        }, {
            path: ':id',
            loadComponent: () => import('./features/authorized/form/form.component'),
        }],
    }, {
        path: 'customer',
        children: [{
            path: '',
            loadComponent: () => import('./features/authorized/customer/list/customer-list.component')
        }],
    }, {
        path: 'insurer',
        children: [{
            path: '',
            loadComponent: () => import('./features/authorized/insurer/list/insurer-list.component')
        }],
    },{
        path: 'division',
        children: [{
            path: '',
            loadComponent: () => import('./features/authorized/division/list/division-list.component')
        }],
    }, {
        path: 'users',
        loadComponent: () => import('./features/authorized/user/list/user-list')
    }],
}, {
    path: 'external/:hash',
    loadComponent: () => import('./features/external/external.component'),
    children: [{
        path: '',
        pathMatch: 'full',
        redirectTo: 'signing'
    }, {
        path: 'signing',
        loadComponent: () => import('./features/external/signing/signing.component'),
    }]
}, {
    path: '**',
    redirectTo: '/'
}];
