export default interface PresentationDate {
  _id: string;
  semester: string;
  admin: string;
  dates: {
    _id: string;
    start: string;
    end: string;
  }[],
  created_at?: Date,
  updated_at?: Date,
}