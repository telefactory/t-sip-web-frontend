
import {map} from 'rxjs/operators';
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { UserManualService } from '../../shared/user-manual.service';
import { UserManual } from '../../shared/models/user-manual';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-user-manual',
  template: '',
  styleUrls: ['./user-manual.component.css']
})
export class UserManualComponent implements OnInit {
  manualType: number;

  constructor(private router: Router,
              private userService: UserService,
              private userManualService: UserManualService,
              private elementRef: ElementRef,
              private http: HttpClient) {
    let user = userService.getUser();
    if(typeof user == 'undefined' || !user.user_manual_type){
        router.navigate(['/']);
    }

    this.manualType = user.user_manual_type;
    this.userManualService.getUserManual(this.manualType).subscribe((userManual: UserManual) => {
      this.getManualDocument(userManual).subscribe((manualContent: string) => {
        this.elementRef.nativeElement.innerHTML = manualContent;
      });
    });
  }

  ngOnInit() {
  }

  getManualDocument(userManual: UserManual){
    return this.http.get('/assets/user-manuals/' + userManual.path, {responseType: 'text'}).pipe(
          map((res: any) => {
            return res;
          }));
  }

}
