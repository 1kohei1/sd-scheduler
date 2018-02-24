import { Model, model, Schema, Document } from 'mongoose';

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

  next();
});

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