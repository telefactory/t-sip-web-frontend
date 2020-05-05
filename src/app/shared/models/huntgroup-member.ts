export class HuntGroupMember {
    hunt_group_member_id: number;
    call_flow_id: number;
    module_id: number;
    hunt_group_id: number;
    description: string;
    destination_number: string;

    constructor(callFlowId: number, moduleId: number, huntGroupMemberId: null, huntGroupId: number){
        this.call_flow_id = callFlowId;
        this.module_id = moduleId;
        this.hunt_group_member_id = huntGroupMemberId;
        this.hunt_group_id = huntGroupId;
        this.description = '';
        this.destination_number = '';
    }
}
