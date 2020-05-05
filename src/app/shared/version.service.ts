
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

import { Version } from './models/version';

@Injectable()
export class VersionService {
    constructor(private http: HttpClient,
        private userService: UserService){}

    version: string;
    cookieKey: string = 'version';

    getVersion(){
        let options = this.userService.getHttpOptions();
        options.headers.set('Content-Type', 'application/json');
        options.headers.set('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT');
        options.headers.set('Cache-Control', 'no-cache');
        options.headers.set('Pragma', 'no-cache');
        return this.http.get('version.json', options).pipe(
            catchError((error:any) => observableThrowError(error)),);
    }

    getLocalVersion(){
        let cookieKey = this.cookieKey + '=';
        let cookies = decodeURIComponent(document.cookie);
        let ca = cookies.split(';');
        for(let i = 0; i < ca.length; i++){
            let c = ca[i];
            while(c.charAt(0) == ' '){
                c = c.substring(1);
            }

            if(c.indexOf(cookieKey) == 0){
                return c.substring(cookieKey.length, c.length);
            }
        }
        return null;
    }

    setLocalVersion(version: string, days: number = 30){
        let date = new Date;
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + date.toUTCString();
        document.cookie = this.cookieKey + '=' + version + ';' + expires + ';path=/';
    }

    checkVersion(){
        this.getVersion()
            .subscribe((res: Version) => {
                let localVersion = this.getLocalVersion();
                if(localVersion == null){
                    this.setLocalVersion(res.version);
                }
                else if(localVersion !== res.version){
                    this.setLocalVersion(res.version);
                    return location.reload(true);
                }
            });
    }

    checkVersionContinuerly(){
        const versionTimeout = 60 * 5 * 1000; // 5 minutes
        this.checkVersion();
        
        setTimeout(() => {
            this.checkVersionContinuerly();
        }, versionTimeout);
    }
}
