import { Model, model, Schema } from 'mongoose';

const FacultySchema = new Schema({
  emails: [String],
  password: String,
  firstName: String,
  lastName: String,
  isAdmin: Boolean,
  signedup_at: Date, // When the password is set
  register_at: Date, // When the admin adds the faculty
  created_at: Date,
  updated_at: Date,
});

FacultySchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

export default model('Faculty', FacultySchema);