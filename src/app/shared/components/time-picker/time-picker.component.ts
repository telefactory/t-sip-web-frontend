import { Component, Input, OnInit, DoCheck, KeyValueDiffers } from '@angular/core';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit, DoCheck {
  @Input() target: any;
  @Input() property: string;
  @Input() function: string;
  @Input() hour: number;
  @Input() minute: number;
  @Input() hourStep: number = 1;
  @Input() minuteStep: number = 15;
  
  time: any = {};

  first: boolean = false;

  differ: any;

  constructor(private differs: KeyValueDiffers){
    this.differ = differs.find({}).create();
  }

  ngOnInit() {
    if (!this.target && !this.property) return;
    if (typeof this.target[this.property] == 'undefined') return;

    if(this.target[this.property]){
        let timeElements = this.target[this.property].split(':');
        if(timeElements.length >= 2){
          this.hour = timeElements[0];
          this.minute = timeElements[1];
        }
    }

    this.time = {
      hour: Number(this.hour),
      minute: Number(this.minute)
    }
  }

  ngDoCheck(){
    let changes = this.differ.diff(this.time);
    if(!changes) return;

    let hour = (this.time.hour < 10 ? '0' : '') + this.time.hour;
    let minute = (this.time.minute < 10 ? '0' : '') + this.time.minute;

    let value = hour + ':' + minute;

    if(typeof this.target[this.function] == 'function')
      this.target[this.function](value, this.first);

    this.first = true;

    this.target[this.property] = hour + ':' + minute;
  }

}
