import { Service } from './service';
import {ServiceGroup} from "./service-group";

export class Customer {
  customer_id: number = null;
  customer_name: string = '';
  contact_name: string = '';
  contact_number: string = '';
  service_groups: Array<ServiceGroup>;
  number_list: Array<Service>;
}
