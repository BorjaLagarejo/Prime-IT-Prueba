import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export const AuthGuard: CanMatchFn = (route, segments: UrlSegment[]) => {
  const _router = inject(Router);
  const _authService = inject(AuthService);

  return _authService.check().pipe(
    switchMap((authenticated) => {
      // If the user is not authenticated...
      if (!authenticated) {
        // Redirect to the sign-in page with a redirectUrl param
        const redirectURL = `/${segments.join('/')}`;
        const urlTree = _router.parseUrl(`login?redirectURL=${redirectURL}`);

        _authService.signOut().subscribe();

        return of(urlTree);
      }

      // Allow the access
      return of(true);
    })
  );
};

export const NoAuthGuard: CanMatchFn = (route, segments: UrlSegment[]) => {
  return inject(AuthService)
    .check()
    .pipe(switchMap((authenticated) => of(!authenticated)));
};
