export default interface Email {
  _id: string;
  key: string;
  sent_by: string;
  to: string[];
  extra: any;
  result: {
    accepted: string[];
    rejected: string[];
  },
  err: object,
  created_at: string,
  updated_at: string,
}