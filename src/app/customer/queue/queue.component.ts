import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { CustomerService } from '../../shared/customer.service';
import { NumberService } from '../../shared/number.service';
import { CallFlow } from '../../shared/models/call-flow';
import { Queue } from '../../shared/models/queue';
import { QueueMember } from '../../shared/models/queue-member';
import { Module } from '../../shared/models/module';


@Component({
    selector: 'app-queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {
    @Input() callFlow: CallFlow;
    @Input() module: Module;
    @Input() queue: Queue;
    differ: any;

    answerQueuePolicyOptions: Array<String> = [
        'NO_ANSWER',
        'ON_ENTER',
        'BEFORE',
        'AFTER'
    ];

    ringTonePolicyOptions: Array<string> = [
        'TRUE_RINGING',
        'FAKE_RINGING',
        'MUSIC'
    ];

    newMember: QueueMember;
    newMemberError: string = '';
    memberErrors: object = {};
    overrideDestinationError: string = '';
    _addNewMember: QueueMember = null;
    validityChecked: boolean = false;

    buttonAnimations = {
        saved: <Boolean>false,
        error: <Boolean>false
    };

    constructor(private customerService: CustomerService,
        private numberService: NumberService,
        private userService: UserService) {
    }

    ngOnInit() {
        this.newMember = new QueueMember(this.callFlow.call_flow_id, this.module.module_id, null, this.queue.queue_id);
    }

    get user() {
        return this.userService.getUser();
    }

    get overrideNumber(): string {
        return this.queue.override_number;
    }

    get overrideActive(): boolean {
        return this.queue.override_active;
    }

    set overrideActive(overrideActive: boolean) {
        this.queue.override_active = overrideActive;
    }

    get missingNumber() {
        return this.overrideActive && this.overrideNumber.length == 0;
    }

    setOverrideNumber(overrideNumber: string) {
        this.queue.override_number = overrideNumber;
    }

    overrideNumberValidity() {
        let validity = '';
        if (this.missingNumber)
            validity = 'MISSING_NUMBER';

        if (!validity.length) {
            if (!this.overrideActive)
                validity = "";
            else {
                let length = this.overrideNumber.replace(/[^0-9]/g, "").length;
                if (length < 8)
                    validity = "TOO_SHORT";
                else {
                    // Check if number has at least 8 numbers, and starts with +, 4 or 9.
                    validity = /^([0-9]{8,})$/.test(this.overrideNumber) ? "" : "INVALID";
                }
            }
        }
        return validity;
    }

    setAnswerQueuePolicy(option: string) {
        this.queue.answer_queue_policy = option;
        return false;
    }

    setRingTonePolicy(option: string) {
        this.queue.ring_tone_policy = option;
        return false;
    }

    deleteQueueMember(memberIndex: number) {
        this.queue.queue_member_list.splice(memberIndex, 1);
    }

/*     addQueueMember() {
        // Create cloned object of newMember
        let newMember = new QueueMember(this.newMember.call_flow_id, this.module.module_id, null, this.queue.queue_id);
        newMember.description = this.newMember.description;
        newMember.destination_number = this.newMember.destination_number;

        // Insert data into array
        this.queue.queue_member_list.push(newMember);

        // Reset values
        this.newMember.destination_number = '';
        this.newMember.description = '';
        this.newMemberError = '';

        // Save customer
        this.saveModule();

    } */

    createNewMember() {
        // Validation
/*         this.changeNewMember();
        if ((this.newMember.description.length == 0 && this.newMember.destination_number.length == 0))
            return; */

        // Create cloned object of newMember
        let newMember = new QueueMember(this.newMember.call_flow_id, this.module.module_id, null, this.queue.queue_id);
        newMember.description = this.newMember.description;
        newMember.destination_number = this.newMember.destination_number;

        // Insert data into array
        this.queue.queue_member_list.push(newMember);

        // Reset values
        this.newMember.destination_number = '';
        this.newMember.description = '';
        this.newMemberError = '';

        // Save customer
        this.saveModule();
    }

    changeNewMember() {
        if (this.newMember.description.length == 0 || this.newMember.destination_number.length == 0) {
            this.newMemberError = 'MISSING_FIELDS';
        } else {
            let validity = this.numberService.validate(this.newMember.destination_number, 8, /^([0-9]{8,})$/);

            if (validity.length > 0) {
                this.newMemberError = validity;
            }
        }
    }

    getActiveQueueMember() {
        let description = '-- Ikke valgt --';

        if (!this.queue.queue_member_list)
            return description;

        let member = this.queue.queue_member_list.find(member => member.active);

        if (member) {
            if (member.description)
                return member.destination_number + ' (' + member.description + ')';
            else
                return member.destination_number;
        }

        return description;
    }

    setActiveQueueMember(memberIndex: number) {
        this.overrideActive = false;
        for (let member of this.queue.queue_member_list)
            member.active = false;
        if (memberIndex >= 0)
            this.queue.queue_member_list[memberIndex].active = true;
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
