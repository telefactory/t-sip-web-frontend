export class ServiceGroupStatistics {
    service_group_statistics_id: number = null;
    service_group_id: number;
    number_id: number;

    constructor(serviceGroupId: number, numberId: number){
        this.service_group_id = serviceGroupId;
        this.number_id = numberId;
    }
}