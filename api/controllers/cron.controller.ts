import { Request, Response } from 'express';
import * as moment from 'moment-timezone';
import { unitOfTime } from 'moment-timezone';
import { Document } from 'mongoose';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';
import Mailer, { MailType } from '../utils/mail.util';

module.exports.presentationReminder = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {},
  };

  const oneHourLater = moment(new Date().toISOString()).add(1, 'hour');
  const oneDayLater = moment(new Date().toISOString()).add(1, 'day');

  const oneHourStart = oneHourLater.clone().add(-5, 'minutes');
  const oneHourEnd = oneHourLater.clone().add(5, 'minutes');
  const oneDayStart = oneDayLater.clone().add(-5, 'minutes');
  const oneDayEnd = oneDayLater.clone().add(5, 'minutes');

  let presentations: Document[] = [];

  DBUtil.findPresentations({
    start: {
      $or: [{
        $gte: oneHourStart,
        $let: oneHourEnd,
      }, {
        $gte: oneDayStart,
        $let: oneDayEnd,
      }]
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

        const now = moment(new Date().toISOString())
        const presentationStart = moment(presentation.get('start'));
        const startsIn = presentationStart.diff(now, 'hour') <= 6 ? '1 hour' : '1 day';

        presentation.get('faculties').forEach((faculty: Document) => {
          emails.push({
            email: faculty.get('email'),
            title: `Group ${group.get('groupNumber')} presentation is in ${startsIn} at ${locationName}`,
            name: `Dr. ${faculty.get('firstName')} ${faculty.get('lastName')}`,
          })
        })

        group.get('members').forEach((member: Document) => {
          emails.push({
            email: member.get('email'),
            title: `Your presentation is in ${startsIn} at ${locationName}`,
            name: `${member.get('firstName')} ${member.get('lastName')}`,
          })
        })

        group.get('members').forEach((member: Document) => {
          emails.push({
            email: member.get('email'),
            title: `${group.get('projectName')} presentation is in ${startsIn} at ${locationName}`,
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

module.exports.remindToSchedule = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {},
  };

}