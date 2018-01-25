import { Moment } from 'moment-timezone';

export default interface Event {
  startTime: Moment;
  endTime: Moment;
  name: string;
}