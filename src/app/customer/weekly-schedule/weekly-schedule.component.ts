import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Schedule } from '../../shared/models/schedule';
import { CustomerService } from '../../shared/customer.service';
import { CallFlow } from '../../shared/models/call-flow';
import { HuntGroupService } from '../../shared/huntgroup.service';
import { UserService } from '../../shared/user.service';

declare var moment: any;
@Component({
  selector: 'app-weekly-schedule',
  templateUrl: './weekly-schedule.component.html',
  styleUrls: ['./weekly-schedule.component.css']
})
export class WeeklyScheduleComponent implements OnInit {
  @Input() schedule: Schedule;
  @Input() callFlow: CallFlow;
  // TODO: Better handling of event type/title

  // TODO: This is the format to convert to/from per 2017-03-22
  // { "day":"MONDAY","type":"Open","start": "08:00", "end": "12:00", "nextMID": "1" }

  // TODO: Update to reflect values stored in database
  daysLookup = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  hours: Array<string> = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
    '24:00'
  ];
  idSequence = 1;
  events: Array<any> = [];
  // TODO: Rename to 'locale'
  no: any = {
    columnFormat: 'dddd',
    firstDay: 1,
    dow: moment().isoWeekday(),
    dayNames: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    slotLabelFormat: 'HH:mm',
    timeFormat: 'H:mm',
    height: 'auto',
    aspectRatio: 0.5
  };
  style: any = {
    'max-width': '300px'
  };

  shortenedTableNames: Object = {
    'HuntGroup': 'RL'
  };

  updatingOpeningInfo = false;

  // New 2017-03-20
  visible = true;
  _viewType = 'agendaDay';

  set viewType(viewType: string) {
    this._viewType = viewType;
    this.style['max-width'] = (viewType === 'agendaDay') ? '300px' : '';
    // A terrible hack, but it works
    this.visible = false;
    setTimeout(() => this.visible = true, 0);
  }

  get viewType() {
    return this._viewType
  }

  get localizedEvents() {
    // Localize days
    for (let event of this.events) {
      if (event.day === 'MONDAY') {
        event.dayLocalized = 'Mandag'
        event.dow = 1;
      }
      if (event.day === 'TUESDAY') {
        event.dayLocalized = 'Tirsdag'
        event.dow = 2;
      }
      if (event.day === 'WEDNESDAY') {
        event.dayLocalized = 'Onsdag'
        event.dow = 3;
      }
      if (event.day === 'THURSDAY') {
        event.dayLocalized = 'Torsdag'
        event.dow = 4;
      }
      if (event.day === 'FRIDAY') {
        event.dayLocalized = 'Fredag'
        event.dow = 5;
      }
      if (event.day === 'SATURDAY') {
        event.dayLocalized = 'Lørdag'
        event.dow = 6;
      }
      if (event.day === 'SUNDAY') {
        event.dayLocalized = 'Søndag'
        event.dow = 7;
      }
    }
    return this.events;
  }

  getShortenedWeekDay(weekday: string) {
    return weekday.substring(0, 3);
  }

  constructor(private modalService: NgbModal,
    private customerService: CustomerService,
    private huntGroupService: HuntGroupService,
    private userService: UserService,
    private http: HttpClient) {
    /*
      This isn't responsive, but at least we can set a sensible value on load.
      (768 and 992 are breakpoints for xs and sm in Twitter Bootstrap.)
    */
    if (window.innerWidth < 768) {
      this.no.columnFormat = 'ddd';
    }
  }

  ngOnInit() {
    // TODO: Set list of types+nextMID once we get to advanced
    let scheduleDefinition = this.schedule.schedule_definition;
    let events = JSON.parse(scheduleDefinition);

    for (let event of events) {
      event.closed = event.type !== 'Open';
      this.events.push(event);
    }
  }

  addDay(day, dow, start, mid, listId, id) {
    this.events.splice(id + 1, 0, {
      'day': day,
      'type': 'Open',
      'start': start,
      'end': '24:00',
      'dayLocalized': day,
      'dow': dow,
      'closed': false,
      'nextMID': mid,
      'listId': listId
    });
    this.setScheduleDefinition();
  }

  removeDay(id) {
    this.events.splice(id, 1);
    this.setScheduleDefinition();
  }

  get dow() {
    return this.no.dow;
  }

  dedupe(arr) {
    const filteredSchedules = arr.filter((schedule, index) => {
      if (!index) {
        return true;
      }
      return schedule.day !== arr[index - 1].day || schedule.type !== arr[index - 1].type || schedule.start !== arr[index - 1].start
        || schedule.end !== arr[index - 1].end || schedule.nextMID !== arr[index - 1].nextMID || schedule.listId !== arr[index - 1].listId;
    });
    return filteredSchedules;
  }

  removeOverlap(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i - 1]) {
        if (arr[i].day === arr[i - 1].day) {
          if (moment(arr[i].start, ['h:m a', 'H:m']).unix() < moment(arr[i - 1].end, ['h:m a', 'H:m']).unix()
          || moment(arr[i].end, ['h:m a', 'H:m']).unix() < moment(arr[i - 1].end, ['h:m a', 'H:m']).unix()) {
            arr.splice(i, 1);
          }
        }
      }
    }
    return arr;
  }

  setScheduleDefinition() {
    let events = [];
  
    for (let event of this.removeOverlap(this.dedupe(this.events))) {
      events.push({
        'day': event.day,
        'type': !event.closed ? 'Open' : 'Closed',
        'start': event.start,
        'end': event.end,
        'nextMID': event.nextMID,
        'listId': event.listId || null
      });
    }
    this.schedule.schedule_definition = JSON.stringify(events);
  }

  setStartHour(event, val) {
    val = val.target.value || '09:00';

    event.start = val;

    if (event.start > event.end) {
      event.end = event.start;
    }

    this.setScheduleDefinition();
  }

  setEndHour(event, val) {
    val = val.target.value || '09:00';

    if (event.start > val) {
      event.end = event.start;
    } else {
      event.end = val;
    }

    this.setScheduleDefinition();
  }

  setNextMID(event, val) {
    val = val.target.value || '';

    if (!val || val.length === 0) {
      event.nextMID = null;
      event.listId = null;
    } else {
      event.nextMID = parseInt(val);
    }

    this.setScheduleDefinition();
  }

  onSelectedChange(val) {
    this.schedule.weekly_closed_list_id = val;
  }

  setNextList(event, val) {
    val = val.target.value || '';

    if (!val || val.length === 0) {
      event.listId = null;
    } else {
      event.listId = parseInt(val);
    }

    this.setScheduleDefinition();
  }

  setClosed(event, val) {
    event.closed = val.target.checked;

    this.setScheduleDefinition();
  }

  isClosed(event) {
    let clock = moment().format('HH:mm:ss');
    return event.closed || event.start > clock || event.end <= clock;
  }

  get nextOpeningMessage(): boolean{
    return this.schedule.next_opening_message;
  }

  set nextOpeningMessage(nextOpeningMessage: boolean){
    this.schedule.next_opening_message = nextOpeningMessage;
  }

  get weeklyClosedPlayMessage(): boolean {
    return this.schedule.weekly_closed_play_message;
  }

  set weeklyClosedPlayMessage(weeklyClosedPlayMessage: boolean) {
    this.schedule.weekly_closed_play_message = weeklyClosedPlayMessage;
  }

  get modules(): Array<any> {
    let moduleList = this.customerService.getConnectedModules(this.callFlow);
    moduleList.sort(this.customerService.sortModules);

    return moduleList.filter((module: any) => module.table_name == 'HuntGroup');
  }

  get missedCallsSinceClosed(){
      if(this.schedule.missed_calls_since_closed === null)
          return '0';

      return this.schedule.missed_calls_since_closed.toString();
  }

  getShortenedTableName(module: any) {
    if (typeof module.table_name === 'undefined') {
      return '';
    }

    if (typeof this.shortenedTableNames[module.table_name] === 'undefined') {
      return '';
    }
    return this.shortenedTableNames[module.table_name];
  }

  getSelectedNextModule(event) {
    let moduleId = event.nextMID || null;

    if (!moduleId) {
      return null;
    }

    return this.modules.find((module: any) => module.module_id === moduleId);
  }

  updateOpeningInfo() {
    // Temporary fix
    this.customerService.updateServiceGroups()
    .subscribe(() => {
    }, (error: any) => {
        console.log("error=" + error);
    });
  }

  getSelectedModuleLists(event): Array<any> {
    let selectedModule = this.getSelectedNextModule(event);

    if (!selectedModule || typeof selectedModule.table_name === 'undefined' || selectedModule.table_name !== 'HuntGroup') {
      return [];
    }

    return selectedModule.data.lists.sort(this.huntGroupService.sortHuntGroupLists);
  }

  get advancedWeeklySchedule(): boolean{
    return this.userService.getUser().advanced_weekly_schedule && this.modules.length > 0;
  }
}
