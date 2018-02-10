import { Model, model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

const FacultySchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: '',
    select: false, // By default, don't return the password field in find. Reference: https://stackoverflow.com/a/12096922/4155129
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
  token: {
    type: String,
    default: '',
  },
  verifyToken: {
    type: String,
    default: '',
  },
  expire_at: Date,
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

FacultySchema.plugin(uniqueValidator, {
  message: '{VALUE} is already registered',
});

export default model('Faculty', FacultySchema);