import { Component, Input} from '@angular/core';
import { UserService } from '../../shared/user.service';
import { CallFlow } from '../../shared/models/call-flow';
import { Announcement } from '../../shared/models/announcement';
import { CommonRecording } from '../../shared/models/common-recording';
import { Module } from '../../shared/models/module';
import {CustomerService} from '../../shared/customer.service';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent {
  @Input() callFlow: CallFlow;
  @Input() module: Module;
  @Input() announcement: Announcement;

  answerCallPolicyOptions: Array<String> = [
    'NO_ANSWER',
    'BEFORE',
    'AFTER'
  ];
  commonRecordings: Array<CommonRecording>;
  userRecordings: Array<string>;

  buttonAnimations = {
    saved: <Boolean>false,
    error: <Boolean>false
  };

  constructor(private userService: UserService, private customerService: CustomerService) {
  }

   get user() {
    return this.userService.getUser();
  }

  setAnswerCallPolicy(option: string) {
    this.announcement.answer_call_policy = option;
    return false;
  }

  getRecording() {
    if (this.announcement.file_name)
      return this.announcement.file_name;

    let description = '-- Ikke valgt --';

    if (this.announcement.common_recording_id && this.commonRecordings) {
      let recording = this.commonRecordings.find(
        recording => recording.recording_id == this.announcement.common_recording_id
      );
      description = "";
    }
    return description;
  }

  setRecording(id: number|string) {
    if (typeof id === "string") {
      this.announcement.file_name = id;
      this.announcement.common_recording_id = 0;
    } else if (typeof id === "number") {
      this.announcement.file_name = null;
      this.announcement.common_recording_id = id;
    } else {
      this.announcement.file_name = null;
      this.announcement.common_recording_id = 0;
    }
    return false;
  }

  saveModule() {
    this.customerService.saveModule(this.module.id, this.module.data)
      .subscribe(() => {
        this.buttonAnimations.saved = true;
      }, (error: any) => {
        this.buttonAnimations.error = true;
        console.log("error=" + error);
      });
    this.buttonAnimations.saved = false;
    this.buttonAnimations.error = false;
  }
}
