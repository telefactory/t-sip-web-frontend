import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CustomerService } from './customer.service';
import { NumberService } from './number.service';
import { UserService } from './user.service';
import { UserManualService } from './user-manual.service';
import { UserNewsService } from './user-news.service';
import { StatisticsService } from './statistics.service';
import { VersionService } from './version.service';
import { HuntGroupService } from './huntgroup.service';

import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  declarations: [
    DatePickerComponent,
    TimePickerComponent
  ],
  providers: [
    CustomerService,
    NumberService,
    UserService,
    UserManualService,
    UserNewsService,
    StatisticsService,
    VersionService,
    HuntGroupService
  ],
  exports: [
    DatePickerComponent,
    TimePickerComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SharedModule { }
