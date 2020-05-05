import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { CustomerService } from './customer.service';
import { Customer } from './models/customer';

@Injectable()
export class CustomerResolverService implements Resolve<Customer> {

  constructor(private customerService: CustomerService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Customer> {
    let customerId = +route.params['id'] || 0;
    return this.customerService.getCustomer(customerId);
  }
}
