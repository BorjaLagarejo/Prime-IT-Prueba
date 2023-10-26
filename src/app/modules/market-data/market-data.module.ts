import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MarketDataComponent } from './market-data.component';

import { MatTableModule } from '@angular/material/table';
import { marketDataResolver } from './market-data.resolver';

export const marketDataRoute: Route[] = [
  {
    path: '',
    component: MarketDataComponent,
    resolve: [marketDataResolver],
  },
];

@NgModule({
  declarations: [MarketDataComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(marketDataRoute),
    MatTableModule,
  ],
})
export class MarketDataModule {}
