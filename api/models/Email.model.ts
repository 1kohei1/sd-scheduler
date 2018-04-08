import { Model, model, Schema, Document } from 'mongoose';

const EmailSchema = new Schema({
  key: {
    type: String,
  },
  sent_by: {
    type: String,
    default: 'system',
  },
  to: [{
    type: String,
  }],
  extra: {
    type: Object,
    default: {},
  },
  result: {
    accepted: [{
      type: String,
    }],
    rejected: [{
      type: String,
    }]
  },
  err: {
    type: Object,
    default: null,
  },
  created_at: Date,
  updated_at: Date,
});

EmailSchema.pre('save', function(this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  next();
});

EmailSchema.post('save', (doc: Document, next: any) => {
  if (doc.get('result').rejected.length > 0 || doc.get('err')) {
    console.log('Error: some problem with email');
    console.log(doc.toJSON());
  }
  next();
});

export default model('Email', EmailSchema);