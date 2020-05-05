import { Component, OnInit } from '@angular/core';
import {UserService} from "../../shared/user.service";
import { UserNewsService } from '../../shared/user-news.service';
import { UserNews } from '../../shared/models/user-news';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.css']
})
export class HelpPageComponent implements OnInit {

    userNews: Array<UserNews>;

    constructor(private userService: UserService,
                private userNewsService: UserNewsService) {
    }

    ngOnInit() {
        this.userNewsService.getUserNewsList()
            .subscribe((userNews: Array<UserNews>) => {
                this.userNews = userNews;
            });
    }

    get user() {
        return this.userService.getUser();
    }

}
