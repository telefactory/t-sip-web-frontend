import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { CustomerComponent } from './customer/customer.component';
import { ServiceComponent } from './service/service.component';
import { CallFlowComponent } from './call-flow/call-flow.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { RouteCallComponent } from './route-call/route-call.component';
import { QueueComponent } from './queue/queue.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { WeeklyScheduleComponent } from './weekly-schedule/weekly-schedule.component';
import { DeleteEventComponent } from './delete-event/delete-event.component';
import { HuntGroupComponent } from './huntgroup/huntgroup.component';
import { HelpPageComponent } from './help-page/help-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedModule
  ],
  declarations: [
    CustomerComponent,
    ServiceComponent,
    CallFlowComponent,
    AnnouncementComponent,
    RouteCallComponent,
    QueueComponent,
    ScheduleComponent,
    WeeklyScheduleComponent,
    DeleteEventComponent,
    HuntGroupComponent,
    HelpPageComponent
  ],
  entryComponents: [ DeleteEventComponent ],
  exports: [ CustomerComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CustomerModule { }
