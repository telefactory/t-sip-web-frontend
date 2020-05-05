import { Component, Input, OnInit } from '@angular/core';
import { CustomerService } from '../../shared/customer.service';
import { NumberService } from '../../shared/number.service';
import { HuntGroup } from '../../shared/models/huntgroup';
import { CallFlow } from '../../shared/models/call-flow';
import { HuntGroupMember } from '../../shared/models/huntgroup-member';
import { HuntGroupListMember } from '../../shared/models/huntgroup-list-member';
import { HuntGroupList } from '../../shared/models/huntgroup-list';
import { HuntGroupService } from '../../shared/huntgroup.service';
import { Module } from '../../shared/models/module';

@Component({
  selector: 'app-huntgroup',
  templateUrl: './huntgroup.component.html',
  styleUrls: ['./huntgroup.component.css']
})
export class HuntGroupComponent implements OnInit {
  @Input() callFlow: CallFlow;
  @Input() huntGroup: HuntGroup;
  @Input() module: Module;
  differ: any;

  newMember: HuntGroupMember;
  newMemberError: string = '';
  memberErrors: object = {};
  overrideDestinationError: string = '';
  _selectedList: HuntGroupList;
  _addNewMember: HuntGroupMember = null;
  _newListName: string = '';
  addListValid: boolean = false;
  validityChecked: boolean = false;

  buttonAnimations = {
    saved: <Boolean>false,
    error: <Boolean>false
};
  constructor(private customerService: CustomerService,
    private numberService: NumberService,
    private huntGroupService: HuntGroupService) {
  }


  ngOnInit() {
    this.newMember = new HuntGroupMember(this.callFlow.call_flow_id, this.module.module_id, null, this.huntGroup.hunt_group_id);
  }

  getDescription(member, length: number = 20) {
    return member.description.length > length ? member.description.toString().substring(0, length) + '..' : member.description;
  }

  get activeTab(): string {
    return this.huntGroupService.getActiveTab(this.huntGroup);
  }

  set activeTab(menu: string) {
    this.huntGroupService.setActiveTab(this.huntGroup, menu);
  }

  get lists(): HuntGroupList[] {
    return this.huntGroup.lists;
  }

  get sortedLists(): HuntGroupList[] {
    return this.lists.sort(this.huntGroupService.sortHuntGroupLists);
  }

  get listsMembers() {
    return this.huntGroup.members;
  }

  get activeList() {
    let list = this.huntGroup.lists.find(
      (huntGroupList: HuntGroupList) => {
        return huntGroupList.hunt_group_list_id == this.huntGroup.active_hg_list_id && huntGroupList.call_flow_id == this.callFlow.call_flow_id;
      }
    );

    if (!list)
      return null;

    return list;
  }

  set activeList(list: HuntGroupList) {
    if (list != null) {
      this.huntGroup.active_hg_member_id = null;
      this.huntGroup.override_destination = null;
    }

    this.huntGroup.active_hg_list_id = list.hunt_group_list_id;
  }

  get activeMember() {
    let member = this.listsMembers.find(
      (huntGroupMember: HuntGroupMember) => {
        return huntGroupMember.hunt_group_member_id == this.huntGroup.active_hg_member_id && huntGroupMember.call_flow_id == this.callFlow.call_flow_id;
      }
    );

    if (!member)
      return null;

    return member;
  }

  set activeMember(member: HuntGroupMember) {
    if (member != null) {
      this.huntGroup.active_hg_list_id = null;
      this.huntGroup.override_destination = null;
    }
    this.huntGroup.active_hg_member_id = member.hunt_group_member_id;
  }

  get activeListMembers() {
    return this.sortedSelectedListMembers;
  }

  getMember(huntGroupListMember: HuntGroupListMember) {
    return this.huntGroup.members.find((m: HuntGroupMember) => m.hunt_group_member_id == huntGroupListMember.hunt_group_member_id);
  }

  get activeHgListMembers() {
    if (typeof this.activeList == 'undefined')
      return [];

    if (typeof this.activeList.members == 'undefined')
      return [];

    let members = [];
    this.activeList.members.forEach((member: HuntGroupListMember) => {

      let findMember = this.huntGroup.members.find((m: HuntGroupMember) => {
        return m.hunt_group_member_id == member.hunt_group_member_id;
      });

      if (!findMember)
        return;

      // Merge findMember and member into one object in members array
      members.push({
        ...findMember,
        ...member
      });
    });

    return members.sort(this.sortListMembers);
  }

  getActiveListMemberActive(member: HuntGroupListMember): boolean {
    return member.active;
  }

  setActiveListMemberActive(member: HuntGroupListMember) {
    member.active = !this.getActiveListMemberActive(member);
  }

  moveActiveListMemberUp(member: HuntGroupListMember) {
    let findThisSequence = this.selectedListMembers.find(
      (m: HuntGroupListMember) => {
        return m.hunt_group_member_id == member.hunt_group_member_id;
      }
    );

    let findPreviousSequence = null;

    this.selectedListMembers.forEach(
      (m: HuntGroupListMember) => {
        if (findPreviousSequence == null && m.sequence < findThisSequence.sequence) {
          findPreviousSequence = m;
        }
        else if (m.sequence < findThisSequence.sequence && findPreviousSequence.sequence < m.sequence) {
          findPreviousSequence = m;
        }
      }
    );

    findThisSequence.sequence--;

    if (findPreviousSequence != null && typeof findPreviousSequence != 'undefined')
      findPreviousSequence.sequence++;
  }

  moveActiveListMemberDown(member: HuntGroupListMember) {
    let findThisSequence = this.selectedListMembers.find(
      (m: HuntGroupListMember) => {
        return m.hunt_group_member_id == member.hunt_group_member_id;
      }
    );

    let findNextSequence = null;

    this.selectedListMembers.forEach(
      (m: HuntGroupListMember) => {
        if (findNextSequence == null && m.sequence > findThisSequence.sequence) {
          findNextSequence = m;
        }
        else if (m.sequence > findThisSequence.sequence && findNextSequence.sequence > m.sequence) {
          findNextSequence = m;
        }
      }
    );

    findThisSequence.sequence++;

    if (findNextSequence != null && typeof findNextSequence != 'undefined')
      findNextSequence.sequence--;
  }

  get selectedList(): HuntGroupList {
    if (typeof this._selectedList == 'undefined')
      this._selectedList = this.activeList;

    return this._selectedList;
  }

  set selectedList(selectedList: HuntGroupList) {
    this._selectedList = selectedList;
  }

  get selectedListMembers() {
    if (!this.selectedList)
      return [];

    return this.selectedList.members;
  }

  get sortedSelectedListMembers() {
    let sortedSelectedListMembers = [];

    this.selectedListMembers.forEach(
      (member: HuntGroupListMember) => {
        if (this.huntGroup.members.find((m) => member.hunt_group_member_id == m.hunt_group_member_id)) {
          sortedSelectedListMembers.push(member);
        }
      }
    );

    sortedSelectedListMembers.sort(this.sortListMembers);
    return sortedSelectedListMembers;
  }

  sortListMembers(a, b) {
    return a.sequence > b.sequence ? 1 : -1;
  }

  set selectedListMembers(selectedListMembers: HuntGroupListMember[]) {
    this.selectedList.members = selectedListMembers;
  }

  get notSelectedMembers() {
    let activeMembers = this.activeListMembers;
    return this.huntGroup.members.filter(
      (member: HuntGroupMember) => {
        return !activeMembers.find(
          (m: HuntGroupMember) => {
            return m.hunt_group_member_id == member.hunt_group_member_id;
          }
        ) ? true : false;
      }
    );
  }

  get sortedNotSelectedMembers() {
    return this.listsMembers.sort(this.sortNotSelectedMembers);
  }

  sortNotSelectedMembers(a, b) {
    return a.description.toLowerCase() < b.description.toLowerCase() ? -1 : (a.description.toLowerCase() > b.description.toLowerCase() ? 1 : 0);
  }

  get addNewMember(): HuntGroupMember {
    return this._addNewMember;
  }

  set addNewMember(addNewMember: HuntGroupMember) {
    this._addNewMember = addNewMember;
  }

  get newListName() {
    return this._newListName;
  }

  set newListName(newListName: string) {
    this._newListName = newListName;
    this.checkNewListValidity();
  }

  ringTimeout(member: HuntGroupListMember): number {
    if (typeof member.ring_timeout == 'undefined' || member.ring_timeout == null)
      return 0;

    return member.ring_timeout;
  }

  setRingTimeout(member: HuntGroupMember, ringTimeout): void {
    let listMember = this.selectedList.members.find(
      (m: HuntGroupListMember) => {
        return m.hunt_group_member_id == member.hunt_group_member_id && m.hunt_group_list_id == this.selectedList.hunt_group_list_id;
      }
    );

    if (!(listMember instanceof Object))
      return;

    listMember.ring_timeout = ringTimeout;
  }

  checkNewListValidity() {
    this.validityChecked = true;
    if (this.newListName.length == 0)
      this.addListValid = false;
    else
      this.addListValid = true;
  }

  addNewList() {
    this.checkNewListValidity();

    if (!this.addListValid)
      return;

    let newList = new HuntGroupList(this.newListName, this.callFlow.call_flow_id, this.module.module_id, this.huntGroup.hunt_group_id);
    this.huntGroup.lists.push(newList);
    this.selectedList = newList;

    this.saveModule();
  }

  get nextSequence(): number {
    let lastSequence = 0;

    this.sortedSelectedListMembers.forEach(
      (member: HuntGroupListMember) => {
        if (member.sequence > lastSequence)
          lastSequence = member.sequence;
      }
    );

    return ++lastSequence;
  }

  runAddNewMember() {
    if (this.addNewMember == null)
      return;

    let listMember = new HuntGroupListMember(this.selectedList.hunt_group_list_id, this.addNewMember.hunt_group_member_id, this.callFlow.call_flow_id, this.module.module_id, this.nextSequence);

    this.addNewMember = null;
    this.selectedListMembers.push(listMember);

    this.saveModule();
  }

  deleteMember(huntGroupListMember: HuntGroupListMember) {
    let member = this.getMember(huntGroupListMember);
    if (!member) {
      return;
    }

    let confirmString = 'Er du sikker på at du vil slette medlemmet \'' + member.description + '\' fra denne listen? Denne handlingen kan ikke angres.';

    if (!confirm(confirmString)) {
      return;
    }

    this.selectedList.members = this.selectedList.members.filter(
      (m: HuntGroupListMember) => {
        return m.hunt_group_member_id != member.hunt_group_member_id;
      }
    );

    this.saveModule();
  }

  deleteList() {

    let listIndex = this.lists.findIndex(
      (list: HuntGroupList) => {
        return list.hunt_group_list_id == this.selectedList.hunt_group_list_id;
      }
    );

    let confirmString = 'Er du sikker på at du vil slette listen \'' + this.lists[listIndex].name + '\'? Denne handlingen kan ikke angres.';

    if (!confirm(confirmString)) {
      return;
    }


    if (this.lists[listIndex].hunt_group_list_id == this.activeList.hunt_group_list_id) {
      // Set new active list due to deleting current active list
      let newActivelist = this.lists.findIndex(
        (list: HuntGroupList) => {
          return list.hunt_group_list_id != this.lists[listIndex].hunt_group_list_id;
        }
      );

      if (typeof this.lists[newActivelist] == 'undefined')
        newActivelist = null;
      else
        newActivelist = this.lists[newActivelist].hunt_group_list_id;

      this.huntGroup.active_hg_list_id = newActivelist;
    }

    // Update selected list
    this.selectedList = this.lists.find(
      (list: HuntGroupList) => {
        return list.hunt_group_list_id == this.huntGroup.active_hg_list_id;
      }
    );

    this.lists.splice(listIndex, 1);

    this.saveModule();
  }

  checkSelectedMember(memberId) {
    return this.selectedListMembers.find((member: HuntGroupListMember) => {
      return member.hunt_group_list_member_id == memberId;
    }) ? true : false;
  }

  changeDescription(value) {
    this.huntGroup.hunt_group_description = value;
  }

  changeRingingTimeout(value) {
    this.huntGroup.ringing_timeout = value;
  }

  changeOverrideDestination(value) {
    this.huntGroup.override_destination = value;
    this.overrideDestinationError = this.numberService.validate(value, 6, /^([0-9]{6,})$/, true);

    if (!this.overrideDestinationError) {
      this.huntGroup.active_hg_list_id = null;
      this.huntGroup.active_hg_member_id = null;
    }
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

  changeMember(member: HuntGroupMember) {
    if (typeof this.memberErrors[member.hunt_group_member_id] != 'undefined') {
      delete this.memberErrors[member.hunt_group_member_id];
    }

    if (typeof this.memberErrors[member.hunt_group_member_id] == 'undefined') {
      this.memberErrors[member.hunt_group_member_id] = [];
    }

    if (member.description.length == 0) {
      this.memberErrors[member.hunt_group_member_id]['description'] = 'MISSING_DESCRIPTION';
    }

    if (member.destination_number.length == 0) {
      this.memberErrors[member.hunt_group_member_id]['number'] = 'MISSING_NUMBER';
    }
    else {
      let validity = this.numberService.validate(member.destination_number, 8, /^([0-9]{8,})$/);

      if (validity.length > 0) {
        this.memberErrors[member.hunt_group_member_id]['number'] = validity;
      }
      else {
        let memberValid = this.huntGroup.members.find(
          (m: HuntGroupMember) => {
            return m.hunt_group_member_id != member.hunt_group_member_id && m.destination_number == member.destination_number;
          }
        ) ? true : false;

        if (memberValid) {
          this.memberErrors[member.hunt_group_member_id]['number'] = 'NUMBER_ALREADY_USED';
        }
      }
    }
  }

  getError(member: HuntGroupMember, error: string) {
    let err = '';
    if (typeof this.memberErrors[member.hunt_group_member_id] != 'undefined' && typeof this.memberErrors[member.hunt_group_member_id][error] != 'undefined') {
      err = this.memberErrors[member.hunt_group_member_id][error];
    }

    return err;
  }

  createNewMember() {
    // Validation
    this.changeNewMember();
    if ((this.newMember.description.length == 0 && this.newMember.destination_number.length == 0))
      return;

    // Create cloned object of newMember
    let newMember = new HuntGroupMember(this.newMember.call_flow_id, this.module.module_id, null, this.huntGroup.hunt_group_id);
    newMember.description = this.newMember.description;
    newMember.destination_number = this.newMember.destination_number;

    // Insert data into array
    this.huntGroup.members.push(newMember);

    // Reset values
    this.newMember.destination_number = '';
    this.newMember.description = '';
    this.newMemberError = '';

    // Save customer
    this.saveModule();
  }

  removeMember(member: HuntGroupMember) {
    let confirmString = 'Er du sikker på at du vil slette medlemmet \'' + member.description + '\'? Denne handlingen kan ikke angres.';

    if (!confirm(confirmString)) {
      return;
    }

    // Ensure this member is removed from all lists to avoid empty values
    this.huntGroup.lists.forEach((list) => {
      list.members = list.members.filter((m) => {
        return m.hunt_group_member_id != member.hunt_group_member_id;
      });
    });

    this.huntGroup.members = this.huntGroup.members.filter(
      (m: HuntGroupMember) => {
        return m.hunt_group_member_id != member.hunt_group_member_id;
      }
    );
    this.saveModule();
    this.changeNewMember();
  }

  isActive(): string {
    // list, number, temporary
    if (this.activeList != null) {
      return 'list';
    }

    if (this.activeMember != null) {
      return 'number';
    }

    if (this.huntGroup.override_destination != null) {
      return 'temporary';
    }

    return '';
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
