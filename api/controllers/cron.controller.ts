import { Request, Response } from 'express';
import * as moment from 'moment-timezone';
import { unitOfTime } from 'moment-timezone';
import { Document } from 'mongoose';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';
import Mailer, { MailType } from '../utils/mail.util';

module.exports.presentationReminder1hour = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {},
  };

  const now = moment(new Date().toISOString());
  now.add(1, 'hour'); // Get moment 1 hour ahead of now. Assuming this API is called nearby :00 or :30

  const start = now.clone();
  start.add(-5, 'minutes');
  const end = now.clone();
  end.add(5, 'minutes');

  let presentations: Document[] = [];

  DBUtil.findPresentations({
    start: {
      $gte: start,
      $let: end,
    }
  }, 'group faculties')
    .then(documents => {
      if (documents.length === 0) {
        APIUtil.successResponse(info, true, res);
      } else {
        presentations = documents;
        const semester = presentations[0].get('semester');
        return DBUtil.findLocations({
          semester,
        })
      }
    })
    .then((locations: Document[]) => {
      const emails: {
        email: string;
        title: string;
        name: string;
      }[] = [];

      presentations.forEach((presentation: Document) => {
        const group = presentation.get('group');
        const location = locations.find(location => {
          return location.get('admin').toString() === group.get('admin').toString();
        });
        const locationName = location ? location.get('location') : 'undefined';

        presentation.get('faculties').forEach((faculty: Document) => {
          emails.push({
            email: faculty.get('email'),
            title: `Group ${group.get('groupNumber')} presentation is in 1 hour at ${locationName}`,
            name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          })
        })

        group.get('members').forEach((member: Document) => {
          emails.push({
            email: member.get('email'),
            title: `Your presentation is in 1 hour at ${locationName}`,
            name: `${member.get('firstName')} ${member.get('lastName')}`,
          })
        })

        group.get('members').forEach((member: Document) => {
          emails.push({
            email: member.get('email'),
            title: `${group.get('projectName')} presentation is in 1 hour at ${locationName}`,
            name: `${member.get('firstName')} ${member.get('lastName')}`,
          })
        });
      });

      return Promise.resolve(emails);
    })
    .then(emails => {
      emails.forEach(email => {
        Mailer.send(
          MailType.presentationreminder, {
            to: email.email,
            extra: {
              title: email.title,
              name: email.name,
            }
          }
        )
      })
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.presentationReminder1day = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {},
  };

}

module.exports.remindToSchedule = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {},
  };

}