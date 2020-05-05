
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';
import { UserNews } from './models/user-news';

@Injectable()
export class UserNewsService {
  constructor(private http: HttpClient,
              private userService: UserService) {
  }

  public getUserNewsList(){
    let options = this.userService.getHttpOptions();

    return this.http.get('rest/users/news', options).pipe(
        map((userNews: Array<UserNews>) => {
            return userNews;
        }))
  }

}
