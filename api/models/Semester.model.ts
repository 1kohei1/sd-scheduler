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

export default model('Semester', SemesterSchema);