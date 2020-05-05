import { Component, Input } from '@angular/core';
import { CustomerService } from '../../shared/customer.service';
import { CallFlow } from '../../shared/models/call-flow';
import { RouteCall } from '../../shared/models/route-call';
import { UserService } from '../../shared/user.service';
import { Module } from '../../shared/models/module';

@Component({
  selector: 'app-route-call',
  templateUrl: './route-call.component.html',
  styleUrls: ['./route-call.component.css']
})
export class RouteCallComponent {
  @Input() callFlow: CallFlow;
  @Input() module: Module;
  @Input() routeCall: RouteCall;

  answerCallPolicyOptions: Array<String> = [
    'NO_ANSWER',
    'BEFORE',
    'AFTER'
  ];

  buttonAnimations = {
    saved: <Boolean>false,
    error: <Boolean>false
  };

  constructor(private customerService: CustomerService, private userService: UserService) {
  }

  get user() {
    return this.userService.getUser();
  }

  setAnswerCallPolicy(option: string) {
    this.routeCall.answer_call_policy = option;
    return false;
  }

  saveModule() {
    this.customerService.saveModule(this.module.id, this.module.data)
      .subscribe(() => {
        this.buttonAnimations.saved = true;
        this.customerService.scheduleChangedOpeningDate = false;
      }, (error: any) => {
        this.buttonAnimations.error = true;
        console.log("error=" + error);
      });
    this.buttonAnimations.saved = false;
    this.buttonAnimations.error = false;
  }
}
