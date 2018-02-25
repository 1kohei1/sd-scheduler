import Faculty from './Faculty';
import { TimeSlotLikeObject } from '../utils/DatetimeUtil';

export default interface PresentationDate {
  _id: string;
  semester: string;
  admin: Faculty;
  dates: TimeSlotLikeObject[],
  created_at?: Date,
  updated_at?: Date,
}