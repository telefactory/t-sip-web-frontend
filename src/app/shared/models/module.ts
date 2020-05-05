import { ModuleId } from './module-id';
import { Announcement } from './announcement';
import { Schedule } from './schedule';
import { HuntGroup } from './huntgroup';
import { CustomerSpecific } from './customer-specific';
import { Email } from './email';
import { IVR } from './ivr';
import { RouteCall } from './route-call';
import { Queue } from './queue';
import { SMS } from './sms';
import { RingBack } from './ringback';
import { PrePaidCheck } from './pre-paid-check';
import { PrePaidUpdate } from './pre-paid-update';

export class Module {
    id: ModuleId;
    module_id: number;
    table_name: string;
    description: string;
    data: Announcement|CustomerSpecific|Email|IVR|RouteCall|Queue|Schedule|SMS|HuntGroup|RingBack|PrePaidCheck|PrePaidUpdate;
}