import { Component, OnInit } from '@angular/core';
import { MarketDataService } from './market-data.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'market-data',
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss'],
})
export class MarketDataComponent implements OnInit {
  public dataSource: any[] = [];
  public displayedColumns: string[] = ['title', 'value1', 'value2'];

  public tableDesign = [
    {
      title: 'Último',
      value1: 'LVAL_NORM.v',
      value1Type: 'number',
      value2: 'LVAL_NORM.d',
      value2Type: 'hour',
    },
    {
      title: 'Cerrar',
      value1: 'CLOSE_ADJ_NORM.v',
      value1Type: 'number',
      value2: 'CLOSE_ADJ_NORM.d',
      value2Type: 'date',
    },
    {
      title: '% de cambio de día',
      value1: 'NC2_PR_NORM.v',
      value1Type: 'percent',
      value2: null,
      value2Type: null,
    },
    {
      title: 'Cambio de día',
      value1: 'NC2_NORM.v',
      value1Type: 'number',
      value2: null,
      value2Type: null,
    },
    {
      title: 'Volumen',
      value1: 'VOL.v',
      value1Type: 'number',
      value2: null,
      value2Type: null,
    },
    {
      title: 'Rotación',
      value1: 'TUR.v',
      value1Type: 'number',
      value2: null,
      value2Type: null,
    },
    {
      title: 'Cierre del año anterior',
      value1: 'PY_CLOSE.v',
      value1Type: 'number',
      value2: 'PY_CLOSE.d',
      value2Type: 'date',
    },
    {
      title: 'YTD %',
      value1: 'YTD_PR_NORM.v',
      value1Type: 'percent',
      value2: null,
      value2Type: null,
    },
  ];

  private _unsubscribeAll: Subject<any> = new Subject();

  /**
   * Constructor
   */
  constructor(
    private _marketDataService: MarketDataService,
    private _authService: AuthService,
    private _router: Router
  ) {}
  /**
   * On init
   */
  ngOnInit(): void {
    this._marketDataService.fields$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resFields) => {
        if (!resFields) return false;

        this.tableDesign.forEach((row) => {
          const key = row.value1.split('.')[0];
          const values = resFields[key];

          // Validamos si la key se encuentra dentro del objeto
          if (!values) return false;

          let tempRowDataSource: any = {};

          const entradas = Object.entries(row);
          for (const [clave, path] of entradas) {
            // Se crea el objeto que se agregara en la tabla
            tempRowDataSource = {
              ...tempRowDataSource,
              [clave]:
                clave === 'title'
                  ? path
                  : path
                  ? this.obtenerValorPorPath(path, resFields)
                  : '',
            };
          }

          this.dataSource.push(tempRowDataSource);

          return true;
        });

        return true;
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Métodos públicos
  // -----------------------------------------------------------------------------------------------------

  signOut() {
    this._authService.signOut().subscribe((res) => {
      this._router.navigate(['/']);
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Métodos privados
  // -----------------------------------------------------------------------------------------------------

  /**
   *
   * @param path URl de donde se tiene que sacar el dato
   * @param objeto Objeto donde se buscará el dato
   * @returns
   */
  private obtenerValorPorPath(path: string, objeto: any) {
    const partes = path.split('.');
    let valor = objeto;

    for (const parte of partes) {
      if (valor && typeof valor === 'object' && parte in valor) {
        valor = valor[parte];
      } else {
        return path; // La propiedad no existe o no es un objeto
      }
    }

    return valor;
  }
}
