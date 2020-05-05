import {Component, OnInit} from '@angular/core';

import {UserService} from '../../shared/user.service';
import {UserManualService} from '../../shared/user-manual.service';
import {CustomerService} from '../../shared/customer.service';
import {User} from '../../shared/models/user';
import {UserManual} from '../../shared/models/user-manual';
import {Customer} from '../../shared/models/customer';


@Component({
    selector: 'app-user-config',
    templateUrl: './user-config.component.html',
    styleUrls: ['./user-config.component.css']
})
export class UserConfigComponent implements OnInit {
    userList: Array<User>;
    _customerList: Array<Customer>;
    userManualList: Array<UserManual>;

    constructor(private userService: UserService,
                private customerService: CustomerService,
                private userManualService: UserManualService) {
    }

    ngOnInit() {
        this.userService.getUsers()
            .subscribe((userList: Array<User>) => {
                this.userList = userList;
            });
        this.customerService.getCustomerList()
            .subscribe((customerList: Array<Customer>) => {
                this._customerList = customerList;
            }, (error: any) => {
                console.log("Unable to fetch customers: " + error);
            });
        this.userManualService.getUserManualList()
            .subscribe((userManualList: Array<UserManual>) => {
                this.userManualList = userManualList;
            }, (error: any) => {
                console.log("Unable to fetch user manuals: " + error)
            });
    }

    get customerList() {
        let list = this._customerList;
        return list.sort((a,b) => a.customer_name > b.customer_name ? 1 : -1);
    }

    getUserManual(user: User){
        if(this.userManualList){
            for(let manual of this.userManualList){
                if(manual.id == user.user_manual_type)
                    return manual;
            }
        }

        return null;
    }

    getCustomerId(user: User) {
        if (this.customerList) {

            for(let cust of this.customerList) {
                if(cust.customer_id == user.customer_id) {
                    return cust;
                }
            }
        }
        return new Customer;
    }

    addUser() {
        this.userService.createUser()
        .subscribe((newUser: User) => {
            this.userList.push(new User(newUser.id, null, null, [], null, null, false, 0, false, false, false, false, false));        
            },
            (error: any) => {
            })
    }


    saveUser(user: User) {
        this.userService.saveUser(user)
            .subscribe(() => {
                },
                (error: any) => {
                })
    }

    deleteUser(user: User) {
        if(confirm('* Er du sikker på at du ønsker å slette ' + user.username + '? Denne handlingen kan ikke reverseres.')){
            this.userService.deleteUser(user)
            .subscribe(() => {
                    this.userList = this.userList.filter(u => u !== user);
                },
                (error: any) => {
                })
        }
    }

}
