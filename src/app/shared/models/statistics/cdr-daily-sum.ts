import { CdrDaily } from './cdr-daily';

export class CdrDailySum {
  number: string;
  answered: number;
  offeredIncoming: number;
  offeredOutgoing: number;
  offered: number;
  seconds: number;
  count_queue_busy: number;
  count_busy: number;
  count_closed: number;

  constructor(number: string) {
    this.number = number;
    this.answered = 0;
    this.offeredIncoming = 0;
    this.offeredOutgoing = 0;
    this.offered = 0;
    this.seconds = 0;
    this.count_queue_busy = 0;
    this.count_busy = 0;
    this.count_closed = 0;
  }

  add(cdrDaily: CdrDaily) {
    if(cdrDaily.direction === 'IN') {
      this.offeredIncoming += cdrDaily.count_call;
      this.count_closed += cdrDaily.count_closed;
    } else {
      this.offeredOutgoing += cdrDaily.count_call;
      this.answered += cdrDaily.count_charge;
      this.seconds += cdrDaily.count_charge_sec;
      this.count_busy += cdrDaily.count_busy;
      this.count_queue_busy += cdrDaily.count_queue_busy;
    }
  }

  get unAnswered() {
    let unanswered: number = this.offeredOutgoing - (this.count_busy + this.answered + this.count_queue_busy);
    return unanswered;
  }

  get minutes() {
    let minutes: number = this.seconds / 60;
    return minutes.toFixed(2);
  }

  get average() {
    let average: number = (this.seconds / 60) / this.answered;
    if(Number.isNaN(average))
      average = 0;

    return average.toFixed(2);
  }

}
