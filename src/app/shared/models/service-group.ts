import { CallFlow } from './call-flow';
import {Service} from "./service";
import { ServiceGroupStatistics } from './service-group-statistics';

export class ServiceGroup {
    service_group_id: number;
    description: string = '';
    start_date: string;
    end_date: string;
    number_list: Array<Service>;
    statistics_list: Array<ServiceGroupStatistics>;
    call_flow: CallFlow;
}