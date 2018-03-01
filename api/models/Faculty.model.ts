import { Model, model, Schema, Document } from 'mongoose';
import * as crypto from 'crypto';
const uniqueValidator = require('mongoose-unique-validator');
const mongooseLifecycle = require('mongoose-lifecycle')

import Mailer, { MailType } from '../utils/mail.util';

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
    default: crypto.randomBytes(48).toString('hex'),
  },
  verifyToken: {
    type: String,
    default: '',
  },
  expire_at: {
    type: Date,
    default: () => {
      const expire_at = new Date();
      expire_at.setDate(expire_at.getDate() + 7); // Set token expire in 7 days
      return expire_at;
    },
  },
  verify_at: Date,
  signup_at: Date, // When the password is set
  password_at: Date, // When the password is set
  created_at: Date,
  updated_at: Date,
});

FacultySchema.pre('save', function (this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

FacultySchema.plugin(mongooseLifecycle);

FacultySchema.plugin(uniqueValidator, {
  message: '{VALUE} is already registered',
});

const FacultyModel = model('Faculty', FacultySchema);

FacultyModel.on('afterInsert', (faculty: Document) => {
  Mailer.send(MailType.invitation, {
    to: faculty.get('email'),
    extra: {
      fromWhom: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
      token: faculty.get('token'),
    }
  })
})

export default FacultyModel;