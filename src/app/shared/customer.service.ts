import { throwError as observableThrowError, of as observableOf } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';
import { Customer } from './models/customer';
import { CallFlow } from './models/call-flow';
import { Announcement } from './models/announcement';
import { RouteCall } from './models/route-call';
import { Queue } from './models/queue';
import { Schedule } from './models/schedule';
import { ServiceGroup } from './models/service-group';
import { CustomerSpecific } from "./models/customer-specific";
import { IVR } from "./models/ivr";
import { Email } from "./models/email";
import { SMS } from "./models/sms";
import { PrePaidCheck } from "./models/pre-paid-check";
import { PrePaidUpdate } from "./models/pre-paid-update";
import { HuntGroup } from './models/huntgroup';
import { RingBack } from './models/ringback';
import { Module } from './models/module';
import { ModuleId } from './models/module-id';

@Injectable()
export class CustomerService {
  private customer: Customer;
  private connectedModules: any = {};
  private customerList: Array<Customer> = [];

  public scheduleChangedOpeningDate: boolean = false;

  constructor(private http: HttpClient,
    private userService: UserService) {
  }

  public getCustomer(customerId: number, force: boolean = false) {
    if (!force && this.customer && this.customer.service_groups && this.customer.customer_id > 0 && this.customer.customer_id == customerId)
      return observableOf(this.customer);

    let options = this.userService.getHttpOptions();

    return this.http.get('rest/customers/' + customerId, options).pipe(
      map((customer: Customer) => {
        this.customer = customer;

        this.connectServices(force);
        return this.customer;
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public clearCustomer() {
    this.customer = null;
  }

  public getCustomerList() {
    let options = this.userService.getHttpOptions();

    return this.http.get('rest/customers', options).pipe(
      map((customerList: Array<Customer>) => {
        Object.assign(this.customerList, customerList);
        return customerList;
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public saveCustomer() {
    let options = this.userService.getHttpOptions();
    return this.http.post('rest/customers/', this.customer, options).pipe(
      map((customer: Customer) => {
        for (let key in customer) {
          this.customer[key] = customer[key];
        }
        this.connectServices(true);
        return this.customer;
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public updateServiceGroups() {
    let options = this.userService.getHttpOptions();
    let id = this.customer.customer_id;

    return this.http.get('rest/servicegroups/customer/' + id, options).pipe(
      map((sgs: Array<ServiceGroup>) => {
        Object.assign(this.customer.service_groups, sgs);
        this.connectServices(true);
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public getServiceGroups(customer_id) {
    let options = this.userService.getHttpOptions();

    return this.http.get('rest/servicegroups/customer/' + customer_id, options).pipe(
      map((sgs: Array<ServiceGroup>) => {
        return sgs;
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public saveServiceGroup(sg: ServiceGroup, list_only = false) {
    let options = this.userService.getHttpOptions();
    
    let sgroup = {...sg};

    if(list_only) {
      delete(sgroup['call_flow']);
      delete(sgroup['statistics_list']);
    }

    return this.http.put('rest/servicegroups/' + sgroup.service_group_id, sgroup, options).pipe(
      map(() => {
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public addModule(callFlow: CallFlow, type: string) {
    let module: Module;

    if (type == 'Announcement')
      module.data = new Announcement();
    else if (type == 'RouteCall')
      module.data = new RouteCall();
    else if (type == 'Queue')
      module.data = new Queue();
    else if (type == 'Schedule')
      module.data = new Schedule();
    else if (type == 'CustomerSpecific')
      module.data = new CustomerSpecific();
    else if (type == 'IVR')
      module.data = new IVR();
    else if (type == 'Email')
      module.data = new Email();
    else if (type == 'SMS')
      module.data = new SMS();
    else if (type == 'HuntGroup')
      module.data = new HuntGroup();
    else if (type == 'RingBack')
      module.data = new RingBack();
    else if (type == 'PrePaidCheck')
      module.data = new PrePaidCheck();
    else if (type == 'PrePaidUpdate')
      module.data = new PrePaidUpdate();
    else
      return;

    callFlow.module_list.push(module);
    return module;
  }

  public saveModule(id: ModuleId, module: Announcement | CustomerSpecific | Email | HuntGroup | IVR | Queue | RingBack | RouteCall | Schedule | SMS | PrePaidCheck | PrePaidUpdate) {
    let options = this.userService.getHttpOptions();

    return this.http.put('rest/modules/' + id.call_flow_id + '/' + id.module_id, module, options).pipe(
      map((remoteModule: Announcement | CustomerSpecific | Email | HuntGroup | IVR | Queue | RingBack | RouteCall | Schedule | SMS | PrePaidCheck | PrePaidUpdate) => {
        Object.assign(module, remoteModule);
        return module;
      }),
      catchError((error: any) => observableThrowError(error)));
  }

  public connectServices(force: boolean = false) {
    if (!force && !this.customer || !this.customer.service_groups) return;

    // Sort service groups correctly
    this.customer.service_groups.sort(this.sortServices);

    for (let group of this.customer.service_groups) {
      this.connectCallFlow(group.call_flow);
    }
  }

  public sortServices(a, b) {
    return a.service_group_id === b.service_group_id ? 0 : (a.service_group_id > b.service_group_id ? 1 : -1);
  }

  public sortModules(a, b) {
    if (a.id.moduleId === b.id.moduleId) {
      return a.id.call_flow_id > b.id.call_flow_id ? 1 : (a.id.call_flow_id < b.id.call_flow_id ? -1 : 0);
    }

    return a.id.moduleId > b.id.moduleId ? 1 : -1;
  }

  public connectCallFlow(callFlow: CallFlow) {
    if (!callFlow) return;
    let connectedModules: Array<Module> = [];
    this.connectModule(callFlow, callFlow.first_mid, connectedModules);

    // Sort modules
    connectedModules.sort(this.sortModules);

    this.connectedModules[callFlow.call_flow_id] = connectedModules;
  }

  public getConnectedModules(callFlow: CallFlow) {
    if (!callFlow || !callFlow.call_flow_id) return;
    return this.connectedModules[callFlow.call_flow_id];
  }

  public getUnconnectedModules(callFlow: CallFlow) {
    if (!callFlow || !callFlow.call_flow_id || !callFlow.module_list) return;
    let connectedModules = this.connectedModules[callFlow.call_flow_id];
    if (!connectedModules) return callFlow.module_list;
    return callFlow.module_list.filter(m => connectedModules.indexOf(m) < 0);
  }

  public connectModule(callFlow: CallFlow, moduleId: number, connectedModules: Array<Module>) {
    if (!moduleId) return;
    let module = this.getModuleById(callFlow.module_list, moduleId);
    let seenModule = this.getModuleById(connectedModules, moduleId);

    if (!module || seenModule) return;

    connectedModules.push(module);

    if (module.table_name == "Announcement") {
      let announcement = module.data as Announcement;
      if (announcement.next_mid)
        this.connectModule(callFlow, announcement.next_mid, connectedModules);


    } else if (module.table_name == "RouteCall") {
      let routeCall = module.data as RouteCall;

      if (routeCall.on_busy_next_mid)
        this.connectModule(callFlow, routeCall.on_busy_next_mid, connectedModules);
      if (routeCall.on_fail_next_mid)
        this.connectModule(callFlow, routeCall.on_fail_next_mid, connectedModules);
      if (routeCall.on_no_answer_next_mid)
        this.connectModule(callFlow, routeCall.on_no_answer_next_mid, connectedModules);

    } else if (module.table_name == "Queue") {
      let queue = module.data as Queue;

      if (queue.busy_mid)
        this.connectModule(callFlow, queue.busy_mid, connectedModules);

    } else if (module.table_name == "IVR") {
      let ivr = module.data as IVR;

      if (ivr.next_mid)
        this.connectModule(callFlow, ivr.next_mid, connectedModules);

    } else if (module.table_name == "CustomerSpecific") {
      let cSpec = module.data as CustomerSpecific;

      if (cSpec.next_mid)
        this.connectModule(callFlow, cSpec.next_mid, connectedModules);

    } else if (module.table_name == "Email") {
      let email = module.data as Email;

      if (email.next_mid)
        this.connectModule(callFlow, email.next_mid, connectedModules);

    } else if (module.table_name == "SMS") {
      let sms = module.data as SMS;

      if (sms.next_mid)
        this.connectModule(callFlow, sms.next_mid, connectedModules);

    } else if (module.table_name == "PrePaidCheck") {
      let prepaidcheck = module.data as PrePaidCheck;

      if (prepaidcheck.continue_mid)
        this.connectModule(callFlow, prepaidcheck.continue_mid, connectedModules);

    } else if (module.table_name == "PrePaidUpdate") {
      let prepaidupdate = module.data as PrePaidUpdate;

      if (prepaidupdate.next_mid)
        this.connectModule(callFlow, prepaidupdate.next_mid, connectedModules);


    } else if (module.table_name == "Schedule") {
      let schedule = module.data as Schedule;

      if (schedule.schedule_type != "ADVANCED") {
        if (schedule.open_mid)
          this.connectModule(callFlow, schedule.open_mid, connectedModules);
        if (schedule.closed_mid)
          this.connectModule(callFlow, schedule.closed_mid, connectedModules);
      }

    } else if (module.table_name == "HuntGroup") {
      let huntgroup = module.data as HuntGroup;

      if (huntgroup.busy_mid)
        this.connectModule(callFlow, huntgroup.busy_mid, connectedModules);
    } else if (module.table_name == "RingBack") {
      let ringback = module.data as RingBack;

      if (ringback.nextMID)
        this.connectModule(callFlow, ringback.nextMID, connectedModules);
    } else {
      // TODO: Throw some kind of error if super admin
    }

  }

  public getModuleById(moduleList: Array<Module>, moduleId: number) {
    if (!moduleId || !moduleList) return;
    let modules = moduleList.find(
      module => module.module_id == moduleId
    );
    return modules;
  }

}
