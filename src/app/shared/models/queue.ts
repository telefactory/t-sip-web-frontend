import { QueueMember } from './queue-member';

export class Queue {
  queue_id: number;
  module_id: number;
  table_name: string = 'Queue';
  description: string;
  connected_call_timeout: number;
  connected_call_warning: boolean;
  allow_extended_call: boolean;
  wait_music: string;
  announce_call: boolean;
  announce_call_msg_type: boolean;
  answer_queue_policy: string;
  ring_tone_policy: string;
  use_true_a_number: boolean;
  present_number: boolean;
  queueing_enabled: boolean;
  give_position: boolean;
  give_position_interval: number;
  alert_caller_when_free: boolean;
  sms_text: string;
  busy_mid: number;
  busy_recording_type: boolean;
  queue_member_list: QueueMember[];
  start_date: string;
  end_date: string;
  show_override: boolean;
  override_number: string;
  override_active: boolean;
}
