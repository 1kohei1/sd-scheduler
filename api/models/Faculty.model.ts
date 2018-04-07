import { Model, model, Schema, Document } from 'mongoose';
import * as crypto from 'crypto';
const uniqueValidator = require('mongoose-unique-validator');
const mongooseLifecycle = require('mongoose-lifecycle')

import DBUtil from '../utils/db.util';
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
  isSystemAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isTestUser: {
    type: Boolean,
    default: false,
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

  handleIsAdminChange(this, next);
});

/**
 * If isAdmin changes from false to true, create PresentationDate and Location
 * If isAdmin changes from true to false, delete PresentationDate and Location
 */
const handleIsAdminChange = (doc: Document, next: any) => {
  if (doc.isModified('isAdmin')) {
    DBUtil.findSemesters()
      .then((semesters: Document[]) => {
        if (semesters.length === 0) {
          return Promise.resolve();
        } else {
          const semester = semesters[0];
          const sid = semester.get('_id');
          const fid = doc.get('_id');

          // isAdmin becomes true
          if (doc.get('isAdmin')) {
            return DBUtil.createPresentationDate({
              semester: sid,
              admin: fid,
              dates: [],
            })
            .then((createdPresentationDate: Document) => {
              return Promise.resolve();
            });
          }
          // isAdmin becomes false
          else {
            return DBUtil.deletePresentationDates({
              semester: sid,
              admin: fid,
            });
          }
        }
      })
      .then(() => {
        next();
      })
      .catch(next);
  } else {
    next();
  }
}

FacultySchema.plugin(mongooseLifecycle);

FacultySchema.plugin(uniqueValidator, {
  message: '{VALUE} is already registered',
});

export default model('Faculty', FacultySchema);