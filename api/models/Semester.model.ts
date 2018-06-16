import { Model, model, Schema, Document } from 'mongoose';

import DBUtil from '../utils/db.util';

const SemesterSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  created_at: Date,
  updated_at: Date,
});

SemesterSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  // If it is creating a new semester, create a presentation date for senior design faculty
  if (this.isNew) {
    DBUtil.findFaculties({
      isAdmin: true,
      isTestUser: false,
    })
      .then((sdFaculties: Document[]) => {
        const promises = sdFaculties.map((sdFaculty: Document) => {
          return DBUtil.createPresentationDate({
            semester: this.get('_id').toString(),
            admin: sdFaculty.get('_id').toString(),
            dates: [],
          });
        });

        return Promise.all(promises);
      })
      .then((presentationDates: Document[]) => {
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

export default model('Semester', SemesterSchema);