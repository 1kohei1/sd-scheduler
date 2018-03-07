import * as moment from 'moment-timezone';
import { Model, model, Schema, Document, Types } from 'mongoose';
import { ObjectID } from 'bson';

import DBUtil from '../utils/db.util';
import Util from '../utils/util';
import Mailer, { MailType } from '../utils/mail.util';

import { DateConstants } from '../../front/models/Constants';
import DatetimeUtil from '../../front/utils/DatetimeUtil'; // This is not clean, but I would like to reuse DatetimeUtil

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
  cancelInfo: {
    canceledBy: String,
    note: String,
  },
  created_at: Date,
  updated_at: Date,
});

PresentationSchema.pre('save', function (this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  presentationValidation(this, next);
});

/**
 * Check if presentation time is valid.
 * Valid presentation time is specified below:
 * 1. start and end is one hour apart and start comes before end
 * 2. Presentation start and end is in the range of presentationDate
 * 3. All faculty is available at specifed time
 * 4. No presentation exists which has the same group.adminFaculty and start and end overlaps 
 *    The same SD 2 faculty cannot join two presentations at the same time
 * 5. At least 30 minutes apart from all presentations if group.adminFaculty is different && share the one faculty in faculties
 */
const presentationValidation = (doc: Document, next: any) => {

  // group is populated according to internal cache. 
  // So if I stop populating group in DBUtil, this generates run time error.
  let adminFaculty = doc.get('group').get('adminFaculty');
  let semester = doc.get('semester');

  // Check condition 1
  new Promise((resolve, reject) => {
    const start = moment(doc.get('start'));
    const end = moment(doc.get('end'));

    if (end.diff(start, 'hour') === 1) {
      resolve();
    } else {
      reject(new Error('Presentation start time must be 1 hour and start must come before end'));
    }
  })
    .then(() => {
      return DBUtil.findPresentationDates({
        semester,
        admin: adminFaculty,
      })
    })
    // Check condition 2
    .then(presentationDates => {
      if (presentationDates.length === 0) {
        return Promise.reject(new Error('Presentation date is not defined for this admin faculty'));
      } else {
        const presentationDate = presentationDates[0];

        const isInSemesterPresentationDate = presentationDate.get('dates')
          .filter((date: Document) => Util.doesOverlap(date, doc))
          .length > 0;

        if (isInSemesterPresentationDate) {
          return DBUtil.findAvailableSlots({
            semester,
            faculty: {
              $in: doc.get('faculties')
            }
          }).exec();
        } else {
          return Promise.reject(new Error('Specified time is not in the semester presentation dates'));
        }
      }
    })
    // Check condition 3
    .then((availableSlots: Document[]) => {
      if (availableSlots.length !== doc.get('faculties').length) {
        return Promise.reject(new Error('One of specified faculties do not exist'));
      } else {
        const isAllFacultiesAvailable = availableSlots
          .map((availableSlot: Document) => {
            return availableSlot.get('availableSlots')
              .filter((availableSlot: Document) => Util.doesOverlap(availableSlot, doc))
              .length > 0;
          })
          .length === doc.get('faculties').length;

        if (isAllFacultiesAvailable) {
          return DBUtil.findPresentations({
            semester,
          }).exec();
        } else {
          return Promise.reject(new Error('Some specified faculties is not available on specified presentation time range'));
        }
      }
    })
    // Check condition 4
    .then((presentations: Document[]) => {
      const overlappingGroups = presentations
        .filter(presentation =>
          presentation.get('_id').toString() !== doc.get('_id').toString() &&
          presentation.get('group').get('adminFaculty') === adminFaculty
        )
        .map((presentation: Document) => {
          // Map to -1 if presentation doesn't overlap with doc.
          // Map to group number if presentation overlaps
          if (Util.doesOverlap(doc, presentation)) {
            return presentation.get('group').get('groupNumber');
          } else {
            return -1;
          }
        })
        .filter((groupNumber: number) => groupNumber >= 0);

      if (overlappingGroups.length > 0) {
        return Promise.reject(new Error(`Presentation time conflicts with Group ${overlappingGroups.join(', ')}`))
      } else {
        return Promise.resolve(presentations);
      }
    })
    // Check condition 5
    .then((presentations: Document[]) => {
      const facultiesIdArray = doc.get('faculties')
        .map((objectId: ObjectID) => objectId.toString());

      const facultiesInHurry = presentations
        .filter(presentation =>
          presentation.get('_id').toString() !== doc.get('_id').toString() &&
          presentation.get('group').get('adminFaculty') !== adminFaculty &&
          // Filter presentations that contain the duplicate faculties
          presentation.get('faculties')
            .map((objectId: ObjectID) => objectId.toString())
            .filter((objectId: string) => facultiesIdArray.indexOf(objectId) >= 0)
            .length > 0
        )
        .map((presentation: Document) => {
          const d1StartM = moment(doc.get('start'));
          const d1EndM = moment(doc.get('end'));
          const d2StartM = moment(presentation.get('end'));
          const d2EndM = moment(presentation.get('end'));

          // d1 < d2
          if (d1EndM.valueOf() < d2StartM.valueOf()) {
            return d2StartM.diff(d1EndM, 'minutes', true) < 30;
          }
          // d2 < d1
          else if (d2EndM.valueOf() < d1StartM.valueOf()) {
            return d1StartM.diff(d2EndM, 'minutes', true) < 30;
          }
          // When two presentation ends and start at the same time, this condition is true
          else {
            return true;
          }
        })
        .filter(facultiesInHurry => facultiesInHurry)
        .length > 0;

      if (facultiesInHurry) {
        return Promise.reject(new Error('Faculties need at least 30 minutes apart if they move to different SD 2 faculty groups'));
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // All validation passes. Save it
      next();
    })
    .catch((err: Error) => {
      next(err);
    });
}

PresentationSchema.post('save', (doc: Document, next: any) => {
  // Don't block the main process.
  next();

  // group is populated from the internal cache
  const group = doc.get('group');
  const groupNumber = group.get('groupNumber');

  const startISO = doc.get('start').toISOString();
  const date = DatetimeUtil.formatISOString(startISO, DateConstants.dateFormat);
  const time = DatetimeUtil.formatISOString(startISO, DateConstants.hourMinFormat);

  // Get faculty to get emails
  DBUtil.findFaculties({
    _id: {
      $in: doc.get('faculties'),
    }
  })
    .then(faculties => {
      const emails: {
        email: string;
        name: string;
        title: string;
        type: string;
      }[] = [];

      faculties.forEach((faculty: Document) => {
        emails.push({
          email: faculty.get('email'),
          name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          title: `Group ${groupNumber} scheduled presentation at ${time} on ${date}`,
          type: 'faculty',
        })
      });

      group.get('members').forEach((member: Document) => {
        if (member.get('email') === 'tobecomebig@gmail.com') {
          emails.push({
            email: member.get('email'),
            name: `${member.get('firstName')} ${member.get('lastName')}`,
            title: `Your final presentation is scheduled at ${time} on ${date}`,
            type: 'group',
          })
        }
      });

      group.get('sponsors').forEach((sponsor: Document) => {
        emails.push({
          email: sponsor.get('email'),
          name: `${sponsor.get('firstName')} ${sponsor.get('lastName')}`,
          title: `Senior design final presentation is scheduled at ${time} on ${date}`,
          type: 'sponsor',
        })
      })

      return Promise.resolve(emails);
    })
    .then(emails => {
      emails.forEach((email) => {
        Mailer.send(MailType.presentation, {
          to: email.email,
          extra: {
            name: email.name,
            title: email.title,
            type: email.type,
          }
        })
      })
    })
    .catch(err => {
      console.log(`Error:PresentationSchema.post.save: ${JSON.stringify(err)}`);
    })
})

// This post hook is not executed. Check why this is not executed.
// PresentationSchema.post('save', (err: MongoError, doc: Document, next: any) => {
//   console.log('post save');
// })

PresentationSchema.post('remove', (doc: Document, next: any) => {
  next();
})

export default model('Presentation', PresentationSchema);