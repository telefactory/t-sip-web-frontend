export class Schedule {
  table_name: string = 'Schedule';
  id: object;
  module_id: number;
  description: string;
  schedule_type: string;
  schedule_definition: string;
  open_mid: number;
  closed_mid: number;
  manual_state: string;
  change_date: number;
  next_opening: string;
  next_opening_message: boolean;
  next_opening_auto_open: boolean;
  next_opening_alert: boolean;
  next_opening_alert_number: string;
  missed_calls_since_closed: number;
  use_user_defined_recording: boolean;
  has_schedule_closed_recording: boolean;
  alert_caller_on_open: boolean;
  weekly_closed_mid: number;
  weekly_closed_list_id: number;
  weekly_closed_play_message: boolean;
}
