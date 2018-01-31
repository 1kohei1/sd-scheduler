import { Model, model, Schema } from 'mongoose';

const SemesterSchema = new Schema({
  key: String,
  displayName: String,
  presentationDates: [{
    start: Date,
    end: Date
  }],
  location: String,
  faculties: [],
  created_at: Date,
  updated_at: Date,
});

SemesterSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
})

export default model('Semester', SemesterSchema);