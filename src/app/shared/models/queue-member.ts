export class QueueMember {
  queue_member_id: number;
  call_flow_id: number;
  module_id: number;
  queue_id: number;
  public description: string;
  destination_number: string;
  active: boolean;
  ringing_timeout: number;
  start_date: string;
  end_date: string;

  constructor(callFlowId: number, moduleId: number, queueMemberId: null, queueId: number){
    this.call_flow_id = callFlowId;
    this.module_id = moduleId;
    this.queue_member_id = queueMemberId;
    this.queue_id = queueId;
    this.description = '';
    this.destination_number = '';
}
}
