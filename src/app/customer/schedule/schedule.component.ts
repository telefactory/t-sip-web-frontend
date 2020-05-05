import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { CustomerService } from '../../shared/customer.service';
import { CallFlow } from '../../shared/models/call-flow';
import { Schedule } from '../../shared/models/schedule';
import { Module } from '../../shared/models/module';

declare var moment: any;

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
    @Input() callFlow: CallFlow;
    @Input() module: Module;
    @Input() schedule: Schedule;

    nextOpeningDateTime: any = '';
    nextOpeningDate: any = '';
    nextOpeningTime: any = '';
    tmpNextOpening: any = '';
    tmpNextOpeningDate: any = '';
    tmpNextOpeningTime: any = '';

    minimumDate: object = {};
    maximumDate: object = {};
    startDate: any = '';

    updatingOpeningInfo: boolean = false;
    missingNumber: boolean = false;

    scheduleTypes: Array<string> = [
        'MANUAL',
        'WEEKLY'
    ];

    buttonAnimations = {
        saved: <Boolean>false,
        error: <Boolean>false
    };

    constructor(private customerService: CustomerService,
        private userService: UserService,
        private cdr: ChangeDetectorRef, ) {
    }

    ngOnInit() {
        if (this.nextOpening) {
            this.nextOpeningDateTime = moment(this.nextOpening).format("YYYY-MM-DD HH:mm:ss");
        }

        let nextOpeningTime = this.nextOpeningDateTime.split(' ');
        if (nextOpeningTime.length >= 2) {
            let newOpeningTime = nextOpeningTime[1].split(':');
            this.startDate = nextOpeningTime[0];

            if (newOpeningTime.length >= 2) {
                this.setOpeningTime(newOpeningTime[0] + ':' + newOpeningTime[1], false);
            }
        }

        let minimumDate = moment();

        this.minimumDate = {
            year: Number(minimumDate.format("YYYY")),
            month: Number(minimumDate.format("MM")),
            day: Number(minimumDate.format("DD"))
        };

        let maximumDate = moment().add(1, 'years').subtract(1, 'day');
        this.maximumDate = {
            year: Number(maximumDate.format("YYYY")),
            month: Number(maximumDate.format("MM")),
            day: Number(maximumDate.format("DD"))
        };
    }

    updateOpeningInfo() {
        // Temporary fix
        this.customerService.updateServiceGroups()
        .subscribe(() => {
        }, (error: any) => {
            console.log("error=" + error);
        });
    }

    get scheduleType() {
        return this.schedule.schedule_type;
    }

    get scheduleDefinition() {
        return this.schedule.schedule_definition;
    }

    set scheduleDefinition(definition: string) {
        this.schedule.schedule_definition = definition;
    }

    set scheduleType(type: string) {
        this.schedule.schedule_type = type;
        // Connect modules in use in call flow
        this.customerService.connectCallFlow(this.callFlow);
    }

    get manualState() {
        return this.schedule.manual_state;
    }

    set manualState(state: string) {
        if (this.schedule.manual_state == 'CLOSED' && state == 'OPEN') {
            // Store temporary values in case of no change
            this.tmpNextOpeningDate = this.nextOpeningDate;
            this.tmpNextOpeningTime = this.nextOpeningTime;
            this.tmpNextOpening = this.nextOpeningDateTime == 'Invalid date' ? null : this.nextOpeningDateTime;

            // Set nextOpening to empty to remove date from user
            this.setOpeningDate('');
            this.setOpeningTime('');
            this.startDate = '';
            this.cdr.detectChanges();
        }
        else if (this.schedule.manual_state == 'OPEN' && state == 'CLOSED') {
            if (this.schedule.missed_calls_since_closed === null) {
                // Saved in database; remove temporary variables.
                this.tmpNextOpeningDate = '';
                this.tmpNextOpeningTime = '';
                this.tmpNextOpening = '';
            }

            this.setOpeningDate(this.tmpNextOpeningDate);
            this.setOpeningTime(this.tmpNextOpeningTime);
            this.startDate = this.tmpNextOpening;
        }
        this.schedule.manual_state = state;
    }

    getScheduleType() {
        return this.schedule.schedule_type;
    }

    setScheduleType(type: string) {
        this.schedule.schedule_type = type;
        return false;
    }

    get nextOpening() {
        return this.schedule.next_opening;
    }


    get missedCallsSinceClosed() {
        if (this.schedule.missed_calls_since_closed === null)
            return '0';

        return this.schedule.missed_calls_since_closed.toString();
    }

    set nextOpening(value) {
        this.schedule.next_opening = value;
    }

    get nextOpeningMessage(): boolean {
        return this.schedule.next_opening_message;
    }

    set nextOpeningMessage(nextOpeningMessage: boolean) {
        this.schedule.next_opening_message = nextOpeningMessage;
    }

    get nextOpeningAutoOpen(): boolean {
        return this.schedule.next_opening_auto_open;
    }

    set nextOpeningAutoOpen(nextOpeningAutoOpen: boolean) {
        this.schedule.next_opening_auto_open = nextOpeningAutoOpen;
    }

    get ClosedMID(): number {
        return this.schedule.closed_mid;
    }

    set ClosedMID(closedMID: number) {
        this.schedule.closed_mid = closedMID;
    }

    get hasScheduleClosedRecording(): boolean {
        return this.schedule.has_schedule_closed_recording;
    }

    set hasScheduleClosedRecording(hasScheduleClosedRecording: boolean) {
        this.schedule.has_schedule_closed_recording = hasScheduleClosedRecording;
    }

    get alertCallerOnOpen(): boolean {
        return this.schedule.alert_caller_on_open;
    }

    set alertCallerOnOpen(alertCallerOnOpen: boolean) {
        this.schedule.alert_caller_on_open = alertCallerOnOpen;
    }

    get nextOpeningAlertNumber(): string {
        if (!this.schedule.next_opening_alert_number || this.schedule.next_opening_alert_number == '0')
            return '';

        return this.schedule.next_opening_alert_number;
    }

    set nextOpeningAlertNumber(nextOpeningAlertNumber: string) {
        if (this.missingNumber && nextOpeningAlertNumber.length > 0)
            this.missingNumber = false;

        this.schedule.next_opening_alert_number = nextOpeningAlertNumber;
    }

    get nextOpeningAlert(): boolean {
        if (this.nextOpeningAlertNumber.length == 0)
            return false;

        return this.schedule.next_opening_alert;
    }

    set nextOpeningAlert(nextOpeningAlert: boolean) {
        if (nextOpeningAlert && this.schedule.next_opening_alert_number.length == 0) {
            this.nextOpeningAlert = false;
        }
        else {
            this.schedule.next_opening_alert = nextOpeningAlert;
        }
    }

    nextOpeningAlertNumberValidity(): string {
        if (this.missingNumber)
            return 'MISSING_NUMBER';

        let validity = "";
        if (!this.nextOpeningAlert)
            validity = "";
        else {
            let length = this.nextOpeningAlertNumber.replace(/[^0-9]/g, "").length;
            if (length < 8)
                validity = "TOO_SHORT";
            else {
                validity = /(^([+][0-9]{8,})|([49][0-9]{7,}))$/.test(this.nextOpeningAlertNumber) ? "" : "INVALID";
            }
        }
        return validity;
    }

    get buttonDisabled(): boolean {
        if (this.dateValidity() == 'PAST') {
            return true;
        } else if (this.nextOpeningAlertNumberValidity() !== '') {
            return true;
        }
        return false;
    }

    setNextOpeningAlertNumber(nextOpeningAlertNumber: string) {
        this.nextOpeningAlertNumber = nextOpeningAlertNumber;
    }

    get changeDate() {
        return this.schedule.change_date;
    }

    getNextOpeningValue(date, time) {
        return moment(date + ' ' + time, "YYYY-MM-DD HH:mm:ss");
    }

    setOpeningDate(value, checkFuture = true, setScheduleChangedOpeningDate: boolean = true) {
        this.customerService.scheduleChangedOpeningDate = setScheduleChangedOpeningDate;

        let dateValidity = this.dateValidity(this.getNextOpeningValue(value, this.nextOpeningTime).format("YYYY-MM-DD HH:mm"));

        if (dateValidity == 'FUTURE' && value != this.nextOpeningDate && checkFuture) {
            let daysInFuture = parseInt(moment.duration(moment.utc(value + 'T00:00:00.000Z').diff(moment(moment.utc().format("YYYY-MM-DDT00:00:00.000Z")))).asDays());

            if (!confirm('Er du sikker på at neste åpningstid er ' + daysInFuture.toString() + ' dager fram i tid?')) {
                let openingDate = this.nextOpeningDate;
                this.setOpeningDate(value, false, setScheduleChangedOpeningDate);
                return this.setOpeningDate(openingDate, false, setScheduleChangedOpeningDate);
            }
        }

        if (this.nextOpeningTime) {
            let nextOpeningValue = this.getNextOpeningValue(value, this.nextOpeningTime);
            this.nextOpeningDateTime = nextOpeningValue.format("YYYY-MM-DD HH:mm");
            this.nextOpening = this.nextOpeningDateTime == 'Invalid date' ? null : this.nextOpeningDateTime;
            this.cdr.detectChanges();
        }

        this.nextOpeningDate = value;
        this.startDate = value;
    }

    setOpeningTime(value, setScheduleChangedOpeningDate: boolean = true) {
        this.customerService.scheduleChangedOpeningDate = setScheduleChangedOpeningDate;

        if (!this.nextOpeningDate && this.nextOpeningDateTime) {
            let split = this.nextOpeningDateTime.split(' ');
            if (split.length >= 1) {
                this.setOpeningDate(split[0], false, setScheduleChangedOpeningDate);
            }
        }
        else {
            let nextOpeningValue = this.getNextOpeningValue(this.nextOpeningDate, value);
            this.nextOpeningDateTime = nextOpeningValue.format("YYYY-MM-DD HH:mm");
            this.nextOpening = this.nextOpeningDateTime == 'Invalid date' ? null : this.nextOpeningDateTime;
            this.cdr.detectChanges();
        }
        this.nextOpeningTime = value;
    }

    dateValidity(date = null) {
        if (this.customerService.scheduleChangedOpeningDate == false) {
            return null;
        }

        if (date == null && (!this.nextOpeningDateTime || this.nextOpeningDateTime == 'Invalid date')) {
            return null;
        }

        let m = moment(date == null ? this.nextOpeningDateTime : date);
        if (!m.isValid()) {
            return null;
        }

        let durationSeconds = moment.duration(m.diff(moment.utc())).asSeconds();
        let durationDays = moment.duration(moment.utc(m.format("YYYY-MM-DDT00:00:00.000Z")).diff(moment(moment.utc().format("YYYY-MM-DDT00:00:00.000Z")))).asDays();

        if (durationSeconds < 0) {
            return 'PAST';
        }
        else if (durationDays >= 14) {
            return 'FUTURE';
        }

        return null;
    }

    get user() {
        return this.userService.getUser();
    }

    getTwoDigitNumber(number) {
        if (Number(number) < 10)
            return '0' + number;

        return number;
    }

    preventDefault($event) {
        if ($event.target.checked && this.nextOpeningAlertNumber.length == 0) {
            this.missingNumber = true;
            $event.preventDefault();
        }

        this.nextOpeningAlert = $event.target.checked;
    }


    saveModule() {
        this.customerService.saveModule(this.module.id, this.module.data)
            .subscribe(() => {
                this.buttonAnimations.saved = true;
                this.customerService.scheduleChangedOpeningDate = false;
            }, (error: any) => {
                this.buttonAnimations.error = true;
                console.log("error=" + error);
            });
        this.buttonAnimations.saved = false;
        this.buttonAnimations.error = false;
    }

}
