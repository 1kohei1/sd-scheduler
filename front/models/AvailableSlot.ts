import { TimeSlotLikeObject } from '../utils/DatetimeUtil';

export default interface AvailableSlot {
  _id: string;
  faculty: string;
  semester: string;
  availableSlots: TimeSlotLikeObject[];
}