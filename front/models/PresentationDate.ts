import Faculty from './Faculty';

export interface PresentationDateDates {
  _id: string;
  start: string;
  end: string;
  location: string;
}

export default interface PresentationDate {
  _id: string;
  semester: string;
  admin: Faculty;
  dates: PresentationDateDates[],
  created_at?: Date,
  updated_at?: Date,
}