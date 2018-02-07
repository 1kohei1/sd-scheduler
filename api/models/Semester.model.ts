import { Model, model, Schema, Document } from 'mongoose';

const SemesterSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  presentationDates: [{
    start: Date,
    end: Date
  }],
  location: String,
  faculties: [{
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
  }],
  created_at: Date,
  updated_at: Date,
});

SemesterSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

SemesterSchema.path('presentationDates').validate((values: Document[]) => {
  let isValid = true;
  values.forEach(value => {
    const presentationDate: any = value.toJSON();
    if (presentationDate.end.valueOf() <= presentationDate.start.valueOf()) {
      isValid = false;
    }
  });
  return isValid;
}, 'Presentation start time must come before end time');

export default model('Semester', SemesterSchema);