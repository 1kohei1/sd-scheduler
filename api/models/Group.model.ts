import { Model, model, Schema, Document } from 'mongoose';

import Mailer, { MailType } from '../utils/mail.util';

const GroupSchema = new Schema({
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
  groupNumber: {
    type: Number,
    required: true,
  },
  adminFaculty: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  verificationCode: {
    type: String,
    default: '',
  },
  verificationCodeReceiverId: {
    type: String,
    default: '',
  },
  verificationCodeExpireAt: {
    type: Date,
    default: null,
  },
  created_at: Date,
  updated_at: Date,
});

GroupSchema.pre('save', function (this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  handleVerificationCodeChange(this, next);
});

const handleVerificationCodeChange = (doc: Document, next: any) => {
  if (doc.isModified('verificationCode')) {
    if (doc.get('verificationCode') !== '') {
      const expireAt = new Date();
      expireAt.setMinutes(expireAt.getMinutes() + 15); // Token expire in 15 minutes
      doc.set('verificationCodeExpireAt', expireAt);

      const member = doc.get('members')
        .find((member: Document) => member.get('_id').toString() === doc.get('verificationCodeReceiverId'));
      if (!member) {
        next('Invalid verification code receiver is specified');
        return;
      }

      Mailer.send(MailType.verifycode, {
        to: [member.get('email')],
        extra: {
          code: doc.get('verificationCode'),
          groupNumber: doc.get('groupNumber'),
          name: `${member.get('firstName')}`
        }
      });
    } else {
      doc.set('verificationCodeExpireAt', null);
      doc.set('verificationCodeReceiverId', '');
    }
    next();
  } else {
    next();
  }
}

export default model('Group', GroupSchema);