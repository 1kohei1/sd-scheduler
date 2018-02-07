import { Model, model, Schema } from 'mongoose';

const AvailableSlotSchema = new Schema({
  faculty: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Faculty',
  },
  semester: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Semester',
  },
  availableSlots: [{
    start: Date,
    end: Date,
  }],
  created_at: Date,
  updated_at: Date,
});

AvailableSlotSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

export default model('AvailableSlot', AvailableSlotSchema);