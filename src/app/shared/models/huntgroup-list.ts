import { HuntGroupMember } from './huntgroup-member';
import { HuntGroupListMember } from './huntgroup-list-member';

export class HuntGroupList {
    hunt_group_list_id: number;
    call_flow_id: number;
    module_id: number;
    hunt_group_id: number;
    name: string;
    members: HuntGroupListMember[];

    constructor(name: string, callFlowId: number, moduleId: number, huntGroupId: number){
        this.hunt_group_list_id = null;
        this.call_flow_id = callFlowId;
        this.module_id = moduleId;
        this.hunt_group_id = huntGroupId;
        this.name = name;
        this.members = [];
    }
}
