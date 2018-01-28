import { Moment } from 'moment-timezone';
import Group from './Group';

export default interface Presentation {
  _id: string;
  start: Moment;
  end: Moment;
  semester: string; // This property will not be populated on the server side
  group: Group;
  faculties: string[]; // This property will not be populated on the server side
  midPresentationLink: string;
  committeeFormLink: string;
  created_at: Date;
  updated_at: Date;
}