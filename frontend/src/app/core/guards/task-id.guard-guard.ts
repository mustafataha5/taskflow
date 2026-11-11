import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const taskIdGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const idParam = route.paramMap.get('id');

  if (!idParam || !/^[1-9]\d*$/.test(idParam)) {
    return router.createUrlTree(['/404']);
  }

  const id = Number(idParam);

  return Number.isSafeInteger(id)
    ? true
    : router.createUrlTree(['/404']);
};