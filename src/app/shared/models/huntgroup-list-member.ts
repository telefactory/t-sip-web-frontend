export class HuntGroupListMember {
    hunt_group_list_member_id: number;
    hunt_group_list_id: number;
    call_flow_id: number;
    module_id: number;
    hunt_group_member_id: number;
    active: boolean;
    ring_timeout: number;
    weight: number;
    sequence: number;

    constructor(huntGroupListId: number, huntGroupMemberId: number, callFlowId: number, moduleId: number, sequence: number){
        this.hunt_group_list_member_id = null;
        this.hunt_group_list_id = huntGroupListId;
        this.hunt_group_member_id = huntGroupMemberId;
        this.call_flow_id = callFlowId;
        this.module_id = moduleId;
        this.active = true;
        this.ring_timeout = 30;
        this.weight = 100;
        this.sequence = sequence;
    }
}
