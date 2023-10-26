import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AuthModule } from './auth/auth.module';

@NgModule({
  imports: [AuthModule],
})
export class CoreModule {
  /**
   * Constructor
   */
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    // No permitir inyecciones múltiples
    if (parentModule) {
      throw new Error(
        'CoreModule ya ha sido cargado. Importe este módulo sólo en el AppModule.'
      );
    }
  }
}
