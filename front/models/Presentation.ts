import { Moment } from 'moment-timezone';

export default interface Presentation {
  _id: string;
  start: Moment;
  end: Moment;
  semester: string;
  group: string; // This will be replaced with actual group interface, but let's keep it as string id
  faculties: any[]; // This will be replaced with actual faculty interface, but let's keep it like this
  midPresentationLink: string;
  committeeFormLink: string;
}