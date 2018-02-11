export default interface Faculty {
  _id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  expire_at: Date,
  verify_at: Date,
  signup_at: Date, // When the password is set
  password_at: Date, // When the password is set
  created_at: Date,
  updated_at: Date,
}