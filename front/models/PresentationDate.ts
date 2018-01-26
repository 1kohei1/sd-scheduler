import { Moment } from 'moment-timezone';

export default interface PresentationDate {
  _id: string;
  start: Moment;
  end: Moment;
}