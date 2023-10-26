import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, switchMap, throwError, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {
  private _authenticated: boolean = false;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accesos
  // -----------------------------------------------------------------------------------------------------

  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  set expiresToken(time: number) {
    localStorage.setItem('expiresToken', time.toString());
  }

  get expiresToken(): number {
    return Number(localStorage.getItem('expiresToken')) ?? 0;
  }

  set refreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  get refreshToken(): string {
    return localStorage.getItem('refreshToken') ?? '';
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Métodos públicos
  // -----------------------------------------------------------------------------------------------------

  singByGrant() {
    // Lanzar error, si el usuario ya está conectado
    if (this._authenticated) {
      return throwError(() => new Error('El usuario ya ha iniciado sesión.'));
    }

    const params = new HttpParams()
      .set('grant_type', 'password')
      .set('scope', 'uaa.user')
      .set('username', environment.username)
      .set('password', environment.password);

    const headers = new HttpHeaders().set(
      'Authorization',
      environment.authorization
    );

    return this._httpClient
      .post(`${environment.apiSolutions}/oauth/token`, null, {
        headers,
        params,
      })
      .pipe(
        switchMap((response: any) => {
          return this.storeToken(response);
        })
      );
  }

  singRefreshToken() {
    // Lanzar error, si no existe el refreshToken
    if (!this.refreshToken) {
      return throwError(() => new Error('El refreshToken no existe.'));
    }

    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', this.refreshToken);

    const headers = new HttpHeaders().set(
      'Authorization',
      environment.authorization
    );

    // Se borra el token antiguo para que no se agregue automáticamente
    localStorage.removeItem('accessToken');

    return this._httpClient
      .post(`${environment.apiSolutions}/oauth/token`, null, {
        headers,
        params,
      })
      .pipe(
        switchMap((response: any) => {
          return this.storeToken(response);
        })
      );
  }

  /**
   * Cerrar sesión
   */
  signOut(): Observable<any> {
    // Elimina los parámetros relacionados con la autenticación de acceso del almacenamiento local.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresToken');
    localStorage.removeItem('refreshToken');

    // Set the authenticated flag to false
    this._authenticated = false;

    // Return the observable
    return of(true);
  }

  /**
   * Comprobar el estado de autenticación
   */
  check(): Observable<boolean> {
    // Comprobar si el usuario ha iniciado sesión
    if (this._authenticated) {
      return of(true);
    }

    // Comprobar la disponibilidad del token de acceso
    if (!this.accessToken) {
      return of(false);
    }

    // Compruebe la fecha de caducidad
    if (this.isTokenExpired()) {
      return this.singRefreshToken().pipe(
        switchMap((response: any) => {
          return of(true);
        }),
        catchError(() => of(false))
      );
    }

    // Si el token de acceso existe y no ha caducado, continua
    return of(true);
  }

  private isTokenExpired() {
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    const timeUntilExpiration = this.expiresToken - currentTime;

    // Si quedan 5 minutos o menos para que expire el token, inicia la renovación del token.
    return timeUntilExpiration <= 300;
  }

  private storeToken(response: any) {
    // Almacenar el token de acceso en el almacenamiento local
    this.accessToken = response.access_token;

    // Almacenar el token de refresco de acceso en el almacenamiento local
    this.refreshToken = response.refresh_token;

    // Calcula el tiempo de expiración sumando el tiempo actual en segundos con el valor expiresIn.
    this.expiresToken = Date.now() / 1000 + response.expires_in;

    // Establecer la bandera autenticado a true
    this._authenticated = true;

    // Devuelve un nuevo observable con la respuesta
    return of(response);
  }
}
