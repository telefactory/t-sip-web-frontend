import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AdminGuardService } from '../shared/admin-guard.service';
import { CustomerResolverService } from '../shared/customer-resolver.service';

import { SharedModule } from '../shared/shared.module';
import { CustomerModule } from '../customer/customer.module';

import { HomeComponent } from './home/home.component';
import { CustomerPageComponent } from './customer-page/customer-page.component';
import { UserConfigComponent } from './user-config/user-config.component';
import { StatsComponent } from './stats/stats.component';
import { UserManualComponent } from './user-manual/user-manual.component';
import { UserManualVideoComponent } from './user-manual-video/user-manual-video.component';

// TODO: These declarations don't belong here, but for now it's convenient
import { CdrStatTableComponent } from '../stats/cdr-stat-table/cdr-stat-table.component';
import { CustomerConfigComponent } from './customer-config/customer-config.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'user-admin', component: UserConfigComponent, canActivate: [ AdminGuardService ] },
      { path: 'customer-admin', component: CustomerConfigComponent, canActivate: [ AdminGuardService ] },
      { path: 'customer', component: CustomerPageComponent,
        resolve: {
          customer: CustomerResolverService
        }
      },
      { path: 'user-manual', component: UserManualComponent },
      { path: 'user-manual/video', component: UserManualVideoComponent }
    ]),
    FormsModule,
    //AccordionModule.forRoot(),
    NgbModule,
    SharedModule,
    CustomerModule
  ],
  declarations: [
    HomeComponent,
    CustomerPageComponent,
    UserConfigComponent,
    StatsComponent,
    //DatePickerComponent,
    CdrStatTableComponent,
    CustomerConfigComponent,
    UserManualComponent,
    UserManualVideoComponent
  ],
  exports: [
    RouterModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [ AdminGuardService, CustomerResolverService ]
})
export class PagesModule { }
