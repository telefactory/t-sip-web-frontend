import { Component, Input, OnInit, DoCheck, KeyValueDiffers, ChangeDetectorRef } from '@angular/core';

//import * as moment from 'moment'
declare var moment: any;

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit, DoCheck {
  private _startDate: any;
  @Input() target: any;
  @Input() property: string;
  @Input() function: string;
  @Input() minDate: object;
  @Input() maxDate: object;
  dateObj: any = {};
  dp: any = {};
  differ: any;

  first: boolean = false;

  constructor(private differs: KeyValueDiffers,
              private cdr: ChangeDetectorRef) {
    this.differ = differs.find({}).create();
  }

  get startDate(){
    return this._startDate;
  }

  @Input()
  set startDate(startDate: string){
    let m = moment(startDate);
    this.changeDate({
      year: Number(m.format('YYYY')),
      month: Number(m.format('MM')),
      day: Number(m.format('DD'))
    });
    this._startDate = m.format('YYYY-MM-DD');
  }

  changeDate(value){
    this.dateObj = value;
  }

  ngOnInit() {
    if (!this.target && !this.property) return;
    if (this.property && typeof this.target[this.property] == 'undefined') return;

    let tmp;
    if(this.startDate){
      tmp = this.startDate.split("-");
    }
    else if(this.target[this.property]){
      tmp = this.target[this.property].toString().split("-");
    }

    if(tmp){
      this.dateObj = {
        year: parseInt(tmp[0]),
        month: parseInt(tmp[1]),
        day: parseInt(tmp[2])
      };
    }
  }

  ngDoCheck() {
    let changes = this.differ.diff(this.dateObj);

    if (!changes) return;
    let m = moment([this.dateObj.year, this.dateObj.month - 1, this.dateObj.day]);
    let value = m.format('YYYY-MM-DD');

    if(typeof this.target[this.function] == 'function')
      this.target[this.function](value, false, this.first);

      this.first = true;
    
    if(this.target[this.property])
      this.target[this.property] = value;
  }
}
