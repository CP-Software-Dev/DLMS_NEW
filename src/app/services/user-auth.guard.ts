import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SellerService } from './seller.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const sellerService = inject(SellerService);
  const router = inject(Router);

  const roleValue = sellerService.getItem('role'); 

  const userRole = roleValue ? parseInt(roleValue, 10) : null;

  const allowedRoutesForRole2 = [
    '/user/dashboard',
    '/user/orders',
    '/user/shipment',
    '/user/ndr',
    '/user/rto',
    '/user/reports',
    '/user/orders/list',
    '/user/status',
    '/user/issues',
    '/user/rto/list'
  ];
  const currentPath = state.url.split('?')[0];

  if (currentPath.startsWith('/admin') && (userRole === 3 || userRole === 4)) {
    router.navigate(['/login']);
    return false;
  }

  if (userRole === 3) {
   
    return true;
  } else if (userRole === 4) {
    // Role 2: Only allow access to specific 'admin' routes
    

    const isAllowedPath = allowedRoutesForRole2.some(basePath => 
      currentPath.startsWith(basePath) ||
      allowedRoutesForRole2.some(path => path.split('/:')[0] === currentPath.split('/:')[0])
    );

    if (isAllowedPath) {
      return true;
    }
  }

  // If none of the conditions are met, redirect to login or a 'not authorized' page
  router.navigate(['/login']);
  return false;
};
