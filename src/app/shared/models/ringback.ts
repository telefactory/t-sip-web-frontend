export class RingBack {
    moduleId: number;
    tableName: string = 'RingBack';
    description: string;
    introFilename: string;
    confirmFilename: string;
    digit: string;
    timeToWait: number;
    nextMID: number;
    timeoutMID: number;
}