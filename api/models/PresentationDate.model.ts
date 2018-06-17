import { Model, model, Schema, Document, Types } from 'mongoose';
import * as moment from 'moment-timezone';

import DBUtil from '../utils/db.util';

const PresentationDateSchema = new Schema({
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
  },
  dates: {
    type: [{
      start: Date,
      end: Date,
      location: String,
    }],
    default: [],
  },
  created_at: Date,
  updated_at: Date,
});

PresentationDateSchema.pre('save', function (this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  this.dates.sort((a: any, b: any) => {
    return moment(a.start).valueOf() - moment(b.start).valueOf();
  });

  // PresentationDate is only updated by SD faculty or system admin.
  // So update corresponding AvailableSlot with given dates
  updateSDFacultyAvailableDate(this, next);
});

const updateSDFacultyAvailableDate = (doc: Document, next: any) => {
  // Get available slot. If it doesn't exist, create one
  DBUtil.findAvailableSlots({
    semester: doc.get('semester'),
    faculty: doc.get('admin')
  })
    .then((availableSlots: Document[]) => {
      if (availableSlots.length === 0) {
        return DBUtil.createAvailableSlots({
          semester: doc.get('semester'),
          faculty: doc.get('admin'),
          dates: [],
        });
      } else {
        return Promise.resolve(availableSlots[0]);
      }
    })
    .then((availableSlot: Document) => {
      const newAvailableSlots = doc.get('dates')
        .map((date: Types.Embedded) => {
          return {
            start: date.get('start'),
            end: date.get('end'),
          }
        });
      return DBUtil.updateAvailalbleSlotById(
        availableSlot.get('_id'), {
          availableSlots: newAvailableSlots,
        }
      )
    })
    .then((updatedAvailableSlot: Document) => {
      next();
    })
    .catch(next);
}

PresentationDateSchema.path('dates').validate((values: Document[]) => {
  let isValid = true;
  values.forEach(value => {
    const date: any = value.toJSON();
    if (date.end.valueOf() <= date.start.valueOf()) {
      isValid = false;
    }
  });
  return isValid;
}, 'Presentation start time must come before end time');

export default model('PresentationDate', PresentationDateSchema);