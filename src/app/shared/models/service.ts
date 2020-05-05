import { CallFlow } from './call-flow';

export class Service {
  number_id: number = null;
  customer_id: number;
  service_group_id: number;
  service_number: string = '';
  description: string = '';
  service_category_id: number;
  start_date: string;
  end_date: string;
  frozen_date : string;
  call_flow_id: number;
}
