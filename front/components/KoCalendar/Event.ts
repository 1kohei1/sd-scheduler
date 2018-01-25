import { Moment } from 'moment';

export default interface Event {
  startTime: Moment;
  endTime: Moment;
  name: string;
}