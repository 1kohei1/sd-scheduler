export default interface Faculty {
  _id: string;
  emails: string[];
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  signedup_at: string; // ISO string
  register_at: string; // ISO string
  created_at: string; // ISO string
  updated_at: string; // ISO string
}