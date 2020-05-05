import { Component, OnInit, Input } from '@angular/core';

import { UserService } from '../../shared/user.service';
import { CustomerService } from '../../shared/customer.service';
import { Service } from '../../shared/models/service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  @Input() service: Service;
  public headerCollapsed = false;

  constructor(private userService: UserService,
              private customerService: CustomerService) { }

  ngOnInit() {

  }

  get user() {
    return this.userService.getUser();
  }

}
