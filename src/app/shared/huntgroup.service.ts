import { Injectable } from '@angular/core';
import { HuntGroup } from './models/huntgroup';

@Injectable()
export class HuntGroupService {
    activeTab = {};

    constructor(){

    }

    getActiveTab(huntGroup: HuntGroup){
        if(typeof this.activeTab[huntGroup.hunt_group_id] == 'undefined')
            return 'manager';
        
        return this.activeTab[huntGroup.hunt_group_id];
    }

    setActiveTab(huntGroup: HuntGroup, menu: string){
        this.activeTab[huntGroup.hunt_group_id] = menu;
    }

    sortHuntGroupLists(a, b){
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0);
    }
}