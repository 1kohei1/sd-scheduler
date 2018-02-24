import { Model, model, Schema, Document } from 'mongoose';

const LocationSchema = new Schema({
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
  },
  location: {
    type: String,
    default: '',
  },
  created_at: Date,
  updated_at: Date,
});

LocationSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

export default model('Location', LocationSchema);