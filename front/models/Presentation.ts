import Group from './Group';

export default interface Presentation {
  _id: string;
  start: string;
  end: string;
  semester: string; // This property will not be populated on the server side
  group: Group;
  faculties: string[]; // This property will not be populated on the server side
  midPresentationLink: string;
  committeeFormLink: string;
  created_at: Date;
  updated_at: Date;
}