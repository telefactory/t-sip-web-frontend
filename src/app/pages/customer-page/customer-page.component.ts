import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { UserService } from '../../shared/user.service';
import { CustomerService } from '../../shared/customer.service';

import { Customer } from '../../shared/models/customer';
import { Service } from '../../shared/models/service';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.component.css']
})
export class CustomerPageComponent implements OnInit {
  public customer: Customer;

  constructor(private route: ActivatedRoute, private router: Router,
    private userService: UserService,
    private customerService: CustomerService) {
  }

  ngOnInit() {
    this.route.data
      .subscribe((data: { customer: Customer }) => {
        this.customer = data.customer;
    });
  }

  saveCustomer() {
    this.customerService.saveCustomer()
      .subscribe((customer: Customer) => {
        //this.router.navigate(['/customer', { id: customer.customerId }]);
      });
  }

  get user() {
    return this.userService.getUser();
  }

}
