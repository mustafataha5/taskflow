import { CanMatchFn } from '@angular/router';

export const numericIdGuard: CanMatchFn = (route, segments) => {
    const id = segments[0]?.path;

  return /^[1-9]\d*$/.test(id ?? '');
};
