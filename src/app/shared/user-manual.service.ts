
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';
import { UserManual } from './models/user-manual';

@Injectable()
export class UserManualService {
  private userManual: UserManual;

  constructor(private http: HttpClient,
              private userService: UserService) {
  }

  public getUserManual(manualId: number){
    if(this.userManual instanceof UserManual)
        return observableOf(this.userManual);

    let options = this.userService.getHttpOptions();
    
    return this.http.get('rest/users/manuals/' + manualId, options).pipe(
        map((userManual: UserManual) => {
            this.userManual = userManual;
            return this.userManual;
        }));
  }

  public getUserManualList(){
    let options = this.userService.getHttpOptions();

    return this.http.get('rest/users/manuals', options).pipe(
        map((userManuals: Array<UserManual>) => {
            return userManuals;
        }))
  }

}
