import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { Fields, Quotes } from 'src/app/interfaces/quotes.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarketDataService {
  private _fields: ReplaySubject<Fields | null> =
    new ReplaySubject<Fields | null>(1);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accesos
  // -----------------------------------------------------------------------------------------------------

  get fields$() {
    return this._fields.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Métodos públicos
  // -----------------------------------------------------------------------------------------------------

  getQuotes() {
    const params = new HttpParams().set(
      'fields',
      'LVAL_NORM,CLOSE_ADJ_NORM,NC2_PR_NORM,NC2_NORM,VOL,TUR,PY_CLOSE,YTD_PR_NORM'
    );

    return this._httpClient
      .get(`${environment.apiSolutions}/quotes/2970161-1058-814`, { params })
      .pipe(
        tap((res: Object) => {
          const quotes: Quotes = res as Quotes;

          const fields = quotes.quotes.at(0)?.fields || null;

          this._fields.next(fields);
        })
      );
  }
}
