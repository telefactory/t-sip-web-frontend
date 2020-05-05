
import {throwError as observableThrowError, of as observableOf,  Observable } from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var moment: any;

import { UserService } from './user.service';
import { CdrDaily } from './models/statistics/cdr-daily';
import { CdrDailySum } from './models/statistics/cdr-daily-sum';

@Injectable()
export class StatisticsService {
  // TODO: from/to date, cache statistics and paging
  statCache: CdrDaily[] = [];
  cacheStart: string;
  cacheEnd: string; // TODO: No use for this, is there?
  // Search parameters
  customStart: string;
  customEnd: string;
  // For use by admin
  customerId: string;

  setCustomerId(customerId: string) {
    if (customerId && customerId != this.customerId) {
      this.statCache = [];
      this.cacheStart = null;
      this.cacheEnd = null;
    }
    this.customerId = customerId;
  }

  constructor(private http: HttpClient, private userService: UserService) { }

  /*
    The max possible toDate will always be in our cache (after the first search), so we don't need to worry about it.
  */

  public loadCDRStats(fromDate: string, toDate: string, forceCacheReload:boolean = false) {

    if(forceCacheReload == true){
      this.cacheStart = null;
      this.cacheEnd = null;
      this.statCache = [];
    }

    if (fromDate >= this.cacheStart) {
      // TODO: This is faking it for now...
      return observableOf(this.getCDRStats(fromDate, toDate));
    }

    // TODO: Always check cache first -- only fetch what we're missing from server
    // TODO: If new period doesn't overlap with previous, do we fetch everything in between? - yes, for now
    let searchEnd = toDate;
    if (this.cacheStart) {
      let m = moment(this.cacheStart, 'YYYY-MM-DD').subtract(1, 'day');
      searchEnd = m.format('YYYY-MM-DD');
    }

    let options = this.userService.getHttpOptions();
    let url = 'rest/statistics';
    if (this.customerId)
      url += '/customer/' + this.customerId;
 

    return this.http.get(url + '/' + fromDate + '/' + searchEnd, options).pipe(
      map((cdrDailyList: CdrDaily[]) => {
        // TODO: Note that this will not work if we want to load stats out of sequence and aggregate sequentially
        // TODO: Also note that we _must_ set searchEnd to avoid getting duplicate stats using this strategy
        this.statCache = cdrDailyList.concat(this.statCache);
        this.cacheStart = fromDate;
        return this.getCDRStats(fromDate, toDate);
      }),
      catchError((error:any) => observableThrowError(error)),);
  }

  /*
    NOTE: This function only uses cache -- only use directly if stats are loaded and an observable is not needed
  */
  public getCDRStats(fromDate: string, toDate: string) {
    let aggr: CdrDailySum[] = [];

    for (let cdrDaily of this.statCache) {
        if (cdrDaily.timestamp < fromDate)
          continue;
        if (cdrDaily.timestamp > toDate)
          break;

        // TODO: This might be a very inefficient lookup strategy -- investigate
        let sum = aggr.find(s => s.number == cdrDaily.original_number);
        if (!sum) {
            sum = new CdrDailySum(cdrDaily.original_number);
            aggr.push(sum);
        }
        sum.add(cdrDaily);
    }

    return aggr.sort((c1, c2) => {
        return c1.number.localeCompare(c2.number);
    });
  }
}
