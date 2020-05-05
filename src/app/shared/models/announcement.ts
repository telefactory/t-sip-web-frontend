export class Announcement {
  table_name: string = 'Announcement';
  module_id: number;
  description: string;
  file_name: string;
  answer_call_policy: string;
  common_recording_id: number;
  wait_for_complete: boolean;
  next_mid: number;
}
