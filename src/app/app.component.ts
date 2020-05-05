import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './shared/user.service';
import { User } from './shared/models/user';
import { Version } from './shared/models/version';
import {CustomerService} from "./shared/customer.service";
import { VersionService } from "./shared/version.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  today: number = Date.now();

  username: string;
  password: string;
  authenticationFlag: boolean;

  constructor(
      private router: Router,
      private customerService: CustomerService,
    private userService: UserService,
    private versionService: VersionService) {
    this.authenticationFlag = true;
    this.versionService.checkVersionContinuerly();
  }

  getCustomer() {
    if (this.userService.getUser()) {
        return this.userService.getCustomerId();
    }
  }

  get user() {
    return this.userService.getUser();
  }

  get version(){
    return this.versionService.getLocalVersion();
  }

  login() {
    this.userService.login(this.username, this.password)
      .subscribe(
        (token: any) => {          
          this.userService.retrieveUserData().subscribe((user: User) => {
            this.authenticationFlag = true;
            //window.location.reload();
            if((user.isAgent() || user.isCustomer()) && !user.isAdmin())
              this.router.navigate(['/customer', { id: this.userService.getCustomerId() }]).then(() => {
                this.checkVersion();
              });
            else
              this.checkVersion();
          },
        (error: any) => {
          this.authenticationFlag = false;
        });
        },
        (error: any) => {
          this.authenticationFlag = false;
        }
      );
  }

  checkVersion(){
    this.versionService.getVersion()
      .subscribe((res: any) => {
          if(typeof this.version !== 'undefined' && this.version !== res.version)
            location.reload(true);
      });
  }

  logout() {
    this.userService.logout();
    this.customerService.clearCustomer();
    this.router.navigate(['/home']);
  }



}
