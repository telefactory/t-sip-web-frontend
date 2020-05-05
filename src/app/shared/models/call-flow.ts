import { Module } from './module';

export class CallFlow {
  call_flow_id: number;
  start_date: Date;
  first_mid: number;
  module_list: Array<Module> = [];
}
