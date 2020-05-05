export class RouteCall {
  table_name: string = 'RouteCall';
  module_id: number;
  description: string;
  destination_number: string;
  answer_call_policy: string;
  use_true_a_number: boolean;
  no_answer_timer: number;
  on_busy_next_mid: number;
  on_fail_next_mid: number;
  on_no_answer_next_mid: number;
}
