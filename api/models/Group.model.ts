import { Model, model, Schema } from 'mongoose';

const GroupSchema = new Schema({
  projectName: {
    type: String,
    required: true,
  },
  semester: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Semester',
  },
  members: [{
    firstName: String,
    lastName: String,
    email: String,
  }],
  sponsors: [{
    firstName: String,
    lastName: String,
    email: String,
  }],
  sponsorName: {
    type: String,
    required: true,
  },
  groupNumber: {
    type: Number,
    required: true,
  },
  adminFaculty: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  created_at: Date,
  updated_at: Date,
});

GroupSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

export default model('Group', GroupSchema);