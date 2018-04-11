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
  projectName: {
    type: String,
    required: true,
  },
  sponsorName: {
    type: String,
    required: true,
  },
  sponsors: [{
    firstName: String,
    lastName: String,
    email: String,
  }],
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
  },
  externalFaculties: [{
    firstName: String,
    lastName: String,
    email: {
      type: String,
      lowercase: true,
    },
  }],
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
  // When admin makes change, this must be false to pass validation. 
  checkFacultyAvailability: {
    type: Boolean,
    default: true,
  },
  created_at: Date,
  updated_at: Date,
});

PresentationSchema.pre('save', function (this: any, next) {
  if (!this.created_at) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();

  // Some times group property is Group model from the internal cache.
  // Regardless of that, get Group from DB
  const groupId = this.get('group') instanceof Types.ObjectId ? this.get('group') : this.get('group').get('_id');
  DBUtil.findGroups({
    _id: groupId,
  })
    .then(groups => {
      if (groups.length === 0) {
        return Promise.reject(new Error('Specified group does not exist'))
      } else {
        const group = groups[0];
        presentationValidation(this, group, next);
      }
    })
    .catch(next)
});

/**
 * Check if presentation time is valid.
 * Valid presentation time is specified below:
 * 1. start and end is one hour apart, start comes before end, and start minute is 00
 * 2. Presentation start and end is in the range of presentationDate
 * 3. Sum of faculties and externalFaculties is at least 4 and adminFaculty is in faculties
 * 4. All faculty is available at specifed time
 * 5. Group has not scheduled the presentations
 * 6. No presentation exists that has at least one of faculties in common and the time overlaps
 */
const presentationValidation = (doc: Document, group: Document, next: any) => {

  let adminFaculty = group.get('adminFaculty');
  let semester = doc.get('semester');

  // Check condition 1
  new Promise((resolve, reject) => {
    const start = moment(doc.get('start'));
    const end = moment(doc.get('end'));

    if (start.isValid() && end.isValid() && end.diff(start, 'hour') === 1 && parseInt(start.format('m')) % 60 === 0) {
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
    .then((AvailableSlots: Document[]) => {
      if (doc.get('faculties').length + doc.get('externalFaculties').length < 4) {
        return Promise.reject(new Error('At least 4 faculties must be present at the presentation'));
      } else {
        const fids = doc.get('faculties').map((fid: Schema.Types.ObjectId) => fid.toString());
        const adminFacultyId = adminFaculty.toString();

        if (fids.indexOf(adminFacultyId) === -1) {
          return Promise.reject(new Error('Your group SD2 faculty must be selected'));
        } else {
          return Promise.resolve(AvailableSlots);
        }
      }
    })
    // Check condition 4
    .then((availableSlots: Document[]) => {
      if (availableSlots.length !== doc.get('faculties').length) {
        return Promise.reject(new Error('One of specified faculties is not available at specified time'));
      }
      // This is the case when admin makes change
      else if (!doc.get('checkFacultyAvailability')) {
        return DBUtil.findPresentations({
          semester,
        }).exec();
      }
      // This is the case that student group makes change
      else {
        const isAllFacultiesAvailable = availableSlots
          .filter((availableSlot: Document) => {
            // Simplify this operation
            return availableSlot.get('availableSlots')
              .filter((availableSlot: Document) => Util.doesCover(availableSlot, doc))
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
    // Check condition 5
    .then((presentations: Document[]) => {
      const sameGroupPresentation = presentations
        .filter(presentation =>
          presentation.get('_id').toString() !== doc.get('_id').toString() &&
          presentation.get('group').get('_id').toString() === group.get('_id').toString()
        )
        .length > 0;

      if (sameGroupPresentation) {
        return Promise.reject(new Error(`Group ${group.get('groupNumber')} has already scheduled the presentation`));
      } else {
        return Promise.resolve(presentations);
      }
    })
    // Check condition 6
    .then((presentations: Document[]) => {
      const overlappingPresentations = presentations
        .filter((presentation: Document) => {
          const presentationFids = presentation
            .get('faculties')
            .map((fid: Schema.Types.ObjectId) => fid.toString());
          const docFids = doc
            .get('faculties')
            .map((fid: Schema.Types.ObjectId) => fid.toString());

          return (
            presentation.get('_id').toString() !== doc.get('_id').toString() &&
            Util.intersection(presentationFids, docFids).length > 0
          )
        })
        .filter((presentation: Document) => Util.doesOverlap(doc, presentation))

      if (overlappingPresentations.length > 0) {
        const groupNumber = overlappingPresentations[0].get('group').get('groupNumber');
        return Promise.reject(new Error(`Some faculties are already booked for specified time`))
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // All validation passes. Save it
      next();
    })
    .catch(next);
}

PresentationSchema.post('save', (doc: Document, next: any) => {
  const groupId = doc.get('group') instanceof Types.ObjectId ? doc.get('group') : doc.get('group').get('_id');
  let group: Document;

  DBUtil.findGroups({
    _id: groupId
  })
    .then(groups => {
      if (groups.length === 0) {
        return Promise.reject(new Error('No group is specified for the presentation'))
      }
      group = groups[0];

      return Promise.all([
        DBUtil.findFaculties({
          _id: {
            $in: doc.get('faculties'),
          }
        }).exec(),
        DBUtil.findPresentationDates({
          semester: group.get('semester'),
          admin: group.get('adminFaculty'),
        })
      ])
    })
    .then(([faculties, presentationDates]: [Document[], Document[]]) => {
      const startISO = doc.get('start').toISOString();
      const date = DatetimeUtil.formatISOString(startISO, DateConstants.dateFormat);
      const time = DatetimeUtil.formatISOString(startISO, DateConstants.hourMinFormat);

      const emails: {
        email: string;
        name: string;
        title: string;
        type: string;
      }[] = [];

      const presentationDate = presentationDates[0].get('dates')
        .find((date: Document) => Util.doesOverlap(date, doc));

      let location = 'undefined';
      if (presentationDate) {
        location = presentationDate.get('location');
      }

      faculties.forEach((faculty: Document) => {
        emails.push({
          email: faculty.get('email'),
          name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          title: `Group ${group.get('groupNumber')} scheduled presentation at ${time} on ${date} at ${location}`,
          type: 'faculty',
        })
      });

      doc.get('externalFaculties').forEach((faculty: Document) => {
        emails.push({
          email: faculty.get('email'),
          name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          title: `Senior design group ${group.get('groupNumber')} invited you to presentation at ${time} on ${date} at ${location}`,
          type: 'externalFaculty',
        })
      });

      group.get('members').forEach((member: Document) => {
        if (member.get('email') === 'tobecomebig@gmail.com') {
          emails.push({
            email: member.get('email'),
            name: `${member.get('firstName')} ${member.get('lastName')}`,
            title: `Your final presentation is scheduled at ${time} on ${date} at ${location}`,
            type: 'group',
          })
        }
      });

      doc.get('sponsors').forEach((sponsor: Document) => {
        emails.push({
          email: sponsor.get('email'),
          name: `${sponsor.get('firstName')} ${sponsor.get('lastName')}`,
          title: `${doc.get('projectName')} presentation is scheduled at ${time} on ${date} at ${location}`,
          type: 'sponsor',
        })
      })

      return Promise.resolve(emails);
    })
    .then(emails => {
      emails.forEach((email) => {
        Mailer.send(MailType.presentation, {
          to: [email.email],
          extra: {
            name: email.name,
            title: email.title,
            type: email.type,
          }
        })
      })
      next();
    })
    .catch(next)
})

// This post hook is not executed. Check why this is not executed.
// PresentationSchema.post('save', (err: MongoError, doc: Document, next: any) => {
//   console.log('post save');
// })

PresentationSchema.post('remove', (doc: Document, next: any) => {
  const facultyQuery = {
    _id: {
      $in: doc.get('faculties'),
    }
  }
  const groupQuery = {
    _id: doc.get('group') instanceof Types.ObjectId ? doc.get('group') : doc.get('group').get('_id')
  }

  Promise.all([
    DBUtil.findFaculties(facultyQuery).exec(),
    DBUtil.findGroups(groupQuery).exec(),
  ])
    .then(([faculties, groups]: [Document[], Document[]]) => {
      if (groups.length === 0) {
        next(new Error('Specified group doesn\'t exist'))
      }
      const group = groups[0];
      const emails: {
        email: string;
        name: string;
        title: string;
        type: string;
        canceledBy: string;
        note: string;
      }[] = [];

      const canceledByFaculty = faculties
        .filter(faculty => faculty.get('_id').toString() === doc.get('cancelInfo').canceledBy)
      [0];
      const canceledBy = `Dr. ${canceledByFaculty.get('firstName')} ${canceledByFaculty.get('lastName')}`
      const { note } = doc.get('cancelInfo');

      faculties.forEach(faculty => {
        emails.push({
          email: faculty.get('email'),
          name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          title: `Group ${group.get('groupNumber')} presentation is canceld since ${canceledBy} becomes unavailable`,
          type: 'faculty',
          canceledBy,
          note,
        });
      });

      doc.get('externalFaculties').forEach((faculty: Document) => {
        emails.push({
          email: faculty.get('email'),
          name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          title: `Senior design group ${group.get('groupNumber')} presentation is canceld since ${canceledBy} becomes unavailable`,
          type: 'externalFaculty',
          canceledBy,
          note,
        });
      });

      group.get('members')
        .forEach((member: Document) => {
          emails.push({
            email: member.get('email'),
            name: `${member.get('firstName')} ${member.get('lastName')}`,
            title: `Your presentation is canceld since ${canceledBy} becomes unavailable`,
            type: 'group',
            canceledBy,
            note,
          });
        });

      doc.get('sponsors')
        .forEach((sponsor: Document) => {
          emails.push({
            email: sponsor.get('email'),
            name: `${sponsor.get('firstName')} ${sponsor.get('lastName')}`,
            title: `${doc.get('projectName')} presentation is canceld since one of faculty member becomes unavailable`,
            type: 'sponsor',
            canceledBy,
            note,
          });
        });

      return Promise.resolve(emails);
    })
    .then(emails => {
      emails.forEach((email) => {
        Mailer.send(MailType.presentationcancel, {
          to: [email.email],
          extra: {
            name: email.name,
            title: email.title,
            type: email.type,
            canceledBy: email.canceledBy,
            note: email.note,
          }
        })
      })
      next();
    })
    .catch(next)
})

export default model('Presentation', PresentationSchema);