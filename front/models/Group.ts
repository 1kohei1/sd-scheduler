import Person from './Person';

export default interface Group {
  _id: string;
  semester: string; // This property will not be populated on the server side
  members: Person[];
  groupNumber: number;
  adminFaculty: string; // This property will not be populated on the server side (probably)
  created_at?: Date;
  updated_at?: Date;
}