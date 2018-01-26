import { Moment } from 'moment-timezone';

export default interface TimeSlot {
  _id: string;
  start: Moment;
  end: Moment;
}