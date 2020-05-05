import { HuntGroupMember } from './huntgroup-member';
import { HuntGroupList } from './huntgroup-list';

export class HuntGroup {
    hunt_group_id: number;
    module_id: number;
    table_name: string = 'HuntGroup';
    hunt_group_description: string;
    active_hg_list_id: number;
    active_hg_member_id: number;
    ringing_timeout: number;
    override_destination: string;
    overflow_mid: number;
    busy_mid: number;
    strategy: string;
    lists: HuntGroupList[];
    active_hunt_group_list: HuntGroupList;
    members: HuntGroupMember[];
}