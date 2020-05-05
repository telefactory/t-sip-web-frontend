
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';


import { User } from './models/user';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable()
export class UserService {
  private user: User;

  constructor(private router: Router, private http: HttpClient) {
    let tokenData = this.getToken();
    if(tokenData && typeof tokenData.token_type != 'undefined' && typeof tokenData.access_token != 'undefined'){
      this.retrieveUserData().subscribe((user: User) => {
        this.user = user;
      });
    }
  }

  public getToken() {
    try {
      return JSON.parse(localStorage.getItem('token'));
    }
    catch(e){
      this.logout();
      this.router.navigate(['/home']);
      return null;
    }
  }

  public getTokenExpires(): number {
    return parseInt(localStorage.getItem('token_expires'));
  }

  public getUser(): User {
    return this.user;
  }

  public getCustomerId() {
    return this.user.customer_id
  }

  public getServiceId() {
      return this.user.service_id;
  }

  public getHttpOptions() {
    let tokenData = this.getToken();
    if(tokenData && typeof tokenData.token_type != 'undefined' && typeof tokenData.access_token != 'undefined'){
      httpOptions.headers = httpOptions.headers.set('Authorization', tokenData.token_type + ' ' + tokenData.access_token);
    }

    return httpOptions;
  }

  public generateGrant(grant: object): object {

    let secret = environment.secret;

    return Object.assign(secret, grant);
  }

  public login(username: string, password: string) {
    let grant: object = this.generateGrant({
      grant_type: 'password',
      username: username,
      password: password
    });

    return this.http.post('rest/oauth/token', grant, this.getHttpOptions()).pipe(
    map((res: any) => {
      if(res.access_token){
        localStorage.setItem('token', JSON.stringify(res));
        localStorage.setItem('token_expires', Date.now() + res.expires_in);
        return res.access_token;
      }
      
    }));
  }

  public getUsers() {
    return this.http.get('rest/users/', this.getHttpOptions()).pipe(
      map((list: Array<any>) => {
        let userList: Array<User> = [];
        for (let item of list) {
          let userManualShowVideo = !item.user_manual || typeof item.user_manual.show_video == 'undefined' ? false : item.user_manual.show_video;
          userList.push(new User(item.id, item.username, item.email, item.roles, item.customer_id, item.service_id, item.show_statistics, item.user_manual_type, userManualShowVideo, item.show_dynamic_service_groups, item.show_statistics_restrictions, item.advanced_weekly_schedule, item.hide_yearly_statistics));
        }
        return userList;
      }),
      catchError((error:any) => observableThrowError(error)),);
  }

  public logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires');
    localStorage.clear();
    this.user = null;
  }

  public retrieveUserData(){
    return this.http.get('rest/users/current', this.getHttpOptions()).pipe(
    map((res: any) => {
      let userManualShowVideo = !res.user_manual || typeof res.user_manual.show_video == 'undefined' ? false : res.user_manual.show_video;
      this.user = new User(null, res.username, res.email, res.roles, res.customer_id, res.service_id, res.show_statistics, res.user_manual_type, userManualShowVideo, res.show_dynamic_service_groups, res.show_statistics_restrictions, res.advanced_weekly_schedule, res.hide_yearly_statistics);
      return this.user;
    }),
    catchError((error: any) => observableThrowError(error)),);
  }

  public createUser() {
    return this.http.post('rest/users', null, this.getHttpOptions()).pipe(
      map((newUser: User) => {
        return newUser;
      }),
      catchError((error:any) => observableThrowError(error)),);
  }

  public saveUser(user: User) {
    return this.http.put('rest/users/' + user.id, user, this.getHttpOptions()).pipe(
      map((savedUser: User) => {
        Object.assign(user, savedUser);
        user.password = null;
        return savedUser;
      }),
      catchError((error:any) => observableThrowError(error)),);
  }

  public deleteUser(user: User) {
      return this.http.delete('rest/users/' + user.id, this.getHttpOptions());
  }

}
