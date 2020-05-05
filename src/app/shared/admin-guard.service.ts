import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { UserService } from './user.service';

@Injectable()
export class AdminGuardService implements CanActivate {

  constructor(private userService: UserService) {}

  canActivate() {
    let user = this.userService.getUser();
    if (user)
      return user.isAdmin();
    return false;
  }

}
