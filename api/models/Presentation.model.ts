import { Model, model, Schema } from 'mongoose';

const PresentationSchema = new Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  faculties: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Faculty'
    }],
    validate: {
      validator: (v: string[]) => 4 <= v.length,
      message: 'At least 4 faculties including SD 2 faculty must be selected.'
    }
  },
  midPresentationLink: {
    type: String,
    default: '',
  },
  committeeFormLink: {
    type: String,
    default: '',
  },
  created_at: Date,
  updated_at: Date,
});

PresentationSchema.pre('save', function (this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

export default model('Presentation', PresentationSchema);