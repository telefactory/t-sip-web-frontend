import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { UserManualService } from '../../shared/user-manual.service';
import { UserManual } from '../../shared/models/user-manual';

@Component({
  selector: 'app-user-video-manual',
  templateUrl: './user-manual-video.component.html',
  styleUrls: ['./user-manual-video.component.css']
})
export class UserManualVideoComponent implements OnInit {
  userManualVideo: string;
  userManualVideoType: string;

  constructor(private router: Router,
              private userService: UserService,
              private userManualService: UserManualService) {
    let user = userService.getUser();
    if(typeof user == 'undefined' || !user.user_manual_type){
        router.navigate(['/']);
    }

    this.userManualService.getUserManual(user.user_manual_type).subscribe((userManual: UserManual) => {
        if(!userManual.show_video)
            router.navigate(['/']);

        // Set video parameters
        this.userManualVideo = '/assets/user-manuals/' + userManual.video_path;
        this.userManualVideoType = userManual.video_type;

        // Refresh video player
        let videoPlayer = document.getElementById('userManualVideo') as HTMLVideoElement;
        videoPlayer.load();
    });
  }

  ngOnInit() {
  }

}
