export default interface AvailableSlot {
  _id: string;
  faculty: string;
  semester: string;
  availableSlots: [{
    _id: string;
    start: string; // ISO string
    end: string;
  }];
}