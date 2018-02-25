import Faculty from './Faculty';

export default interface Location {
  _id: string;
  semester: string;
  admin: Faculty;
  location: string;
  created_at?: Date;
  updated_at?: Date;
}