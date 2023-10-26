import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Constructor
   */
  constructor(private _authService: AuthService) {}

  /**
   * Intercept
   *
   * @param req
   * @param next
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request object
    let newReq = req.clone();

    if (this._authService.accessToken) {
      newReq = req.clone({
        headers: req.headers.set(
          'Authorization',
          'Bearer ' + this._authService.accessToken
        ),
      });
    }

    // Response
    return next.handle(newReq).pipe(
      catchError((error) => {
        console.log('🚀 ~ error', error);
        // Catch "401 Unauthorized" responses
        if (
          error instanceof HttpErrorResponse &&
          (error.status === 401 || error.status === 0)
        ) {
          // Sign out
          this._authService.signOut();

          // Reload the app
          location.reload();
        }

        return throwError(error);
      })
    );
  }
}
