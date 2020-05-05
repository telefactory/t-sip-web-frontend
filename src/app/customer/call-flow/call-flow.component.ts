import { Component, OnInit, Input } from '@angular/core';
import { CustomerService } from '../../shared/customer.service';
import { UserService } from '../../shared/user.service';
import { CallFlow } from '../../shared/models/call-flow';
import { ServiceGroup } from "../../shared/models/service-group";
import { Customer } from "../../shared/models/customer";

@Component({
  selector: 'app-call-flow',
  templateUrl: './call-flow.component.html',
  styleUrls: ['./call-flow.component.css']
})
export class CallFlowComponent implements OnInit {
   @Input() callFlow: CallFlow;
  myDate: Date;

  constructor(private customerService: CustomerService, private userService: UserService) { }

  ngOnInit() {
  }

  get connectedModules() {
    let moduleList = this.callFlow.module_list;
    moduleList.sort(this.customerService.sortModules);

    return moduleList.filter((module) => {
      return this.user.isAdmin() || (module.table_name != "Announcement")
        && module.table_name != "IVR"
        && module.table_name != "Email"
        && module.table_name != "RingBack"
        && module.table_name != "PrePaidCheck"
        && module.table_name != "PrePaidUpdate";
    });
  }

  get user() {
    return this.userService.getUser();
  }
}
