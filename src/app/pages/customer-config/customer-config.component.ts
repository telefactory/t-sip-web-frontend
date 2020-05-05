import { Component, OnInit } from '@angular/core';
import {Customer} from "../../shared/models/customer";
import {UserService} from "../../shared/user.service";
import {CustomerService} from "../../shared/customer.service";
import {User} from "../../shared/models/user";

@Component({
  selector: 'app-customer-config',
  templateUrl: './customer-config.component.html',
  styleUrls: ['./customer-config.component.css']
})
export class CustomerConfigComponent implements OnInit {

    customerList: Array<Customer>;

    constructor(private userService: UserService,
                private customerService: CustomerService) {
    }

    ngOnInit() {
        this.customerService.getCustomerList()
            .subscribe((customerList: Array<Customer>) => {
                this.customerList = customerList;
            }, (error: any) => {
                console.log("Unable to fetch customers: " + error);
            });
    }

}
