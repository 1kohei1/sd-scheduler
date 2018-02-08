import { Model, model, Schema } from 'mongoose';

const FacultySchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
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