import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MarketDataService } from './market-data.service';

export const marketDataResolver: ResolveFn<any> = (route, state) => {
  return inject(MarketDataService).getQuotes();
};
