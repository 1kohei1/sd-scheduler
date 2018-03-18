import { Request, Response } from 'express';
import { Document } from 'mongoose';
import * as crypto from 'crypto';

import APIUtil from '../utils/api.util';
import DBUtil from '../utils/db.util';
import Mailer, { MailType } from '../utils/mail.util';

module.exports.findFaculty = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findFaculties(req.query)
    .then(faculties => {
      APIUtil.successResponse(info, faculties, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.createFaculty = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      body: req.body,
    }
  };

  let newFaculty: Document;

  DBUtil.createFaculty(req.body)
    .then(newF => {
      newFaculty = newF;
      // Add new faculty to current semester
      return DBUtil.findSemesters().exec();
    })
    .then((semesters: Document[]) => {
      if (semesters.length === 0) {
        return Promise.resolve(undefined);
      } else {
        const currentSemester = semesters[0];
        const faculties = currentSemester.get('faculties');
        faculties.push(newFaculty.get('_id'));
        return DBUtil.updateSemesterById(
          currentSemester.get('_id'),
          {
            faculties,
          }
        );
      }
    })
    .then((updatedSemester: Document | undefined) => {
      APIUtil.successResponse(info, newFaculty, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.sendPasswordResetEmail = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      email: req.body.email,
    }
  };

  const email = req.body.email;
  if (!email) {
    info.debugInfo.message = 'Email is not given to API';
    return APIUtil.errorResponse(info, 'Emails is not given to API', {}, res);
  }

  DBUtil.findFaculties({
    email,
    isSystemAdmin: true,
    isTestUser: true,
  })
    .then(faculties => {
      if (!faculties || faculties.length === 0) {
        return Promise.reject({
          message: 'No user is found',
        });
      }

      const faculty = faculties[0];

      const token = crypto.randomBytes(48).toString('hex');
      const expire_at = new Date();
      expire_at.setMinutes(expire_at.getMinutes() + 30); // Set token expire in 30 minutes

      info.debugInfo._id = faculty.get('_id');

      return DBUtil.updateFacultyById(faculty.get('_id'), {
        token,
        expire_at,
      })
    })
    .then(updatedFaculty => {
      APIUtil.successResponse(info, updatedFaculty, res);
      Mailer.send(MailType.passwordreset, {
        to: email,
        extra: {
          name: `Dr. ${updatedFaculty.get('firstName')} ${updatedFaculty.get('lastName')}`,
          token: updatedFaculty.get('token'),
        }
      });
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.updateFaculty = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      _id: req.params._id,
      body: req.body,
    }
  };

  const _id = req.params._id;
  const update: any = req.body;
  let shouldSendVerifyEmail = false;

  DBUtil.findFacultyById(_id)
    .then(faculty => {
      if (!faculty) {
        return Promise.reject({
          message: 'Document is not found',
        })
      } else {
        if (update.hasOwnProperty('email') && update.email !== faculty.get('email')) {
          update.emailVerified = false;
          update.verifyToken = crypto.randomBytes(48).toString('hex');
        
          shouldSendVerifyEmail = true;
        }

        return DBUtil.updateFacultyById(_id, update);
      }
    })
    .then(updatedFaculty => {
      APIUtil.successResponse(info, updatedFaculty, res);
      
      if (shouldSendVerifyEmail) {
        Mailer.send(MailType.verify, {
          to: updatedFaculty.get('email'),
          extra: {
            name: `Dr. ${updatedFaculty.get('firstName')} ${updatedFaculty.get('lastName')}`,
            token: updatedFaculty.get('verifyToken'),
          }
        })
      }
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.verify = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
    }
  };

  const verifyToken = crypto.randomBytes(48).toString('hex');

  DBUtil.updateFacultyById(req.params._id, {
    verifyToken,
  })
    .then(updatedFaculty => {
      APIUtil.successResponse(info, updatedFaculty, res);
      Mailer.send(MailType.verify, {
        to: updatedFaculty.get('email'),
        extra: {
          name: `Dr. ${updatedFaculty.get('firstName')} ${updatedFaculty.get('lastName')}`,
          token: updatedFaculty.get('verifyToken'),
        }
      })
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.updatePassword = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      token: req.params.token,
      body: req.body,
    }
  };

  let update: any = {};
  if (req.body.password) {
    update.password = req.body.password;
  } else {
    info.debugInfo.message = 'Password is not given to API';
    APIUtil.errorResponse(info, 'Password is not given to API', {}, res);
    return;
  }

  const _id = req.params._id;
  let shouldSendWelcomeEmail = false;

  DBUtil.updateFacultyById(_id, update)
    .then(updatedFaculty => {
      update = {
        token: '',
        expire_at: null,
        password_at: new Date(),
      }
      if (!updatedFaculty.get('signup_at')) {
        shouldSendWelcomeEmail = true;
        update.signup_at = new Date();
      }
      // To successfully come here, they have to receive token by the email. So set emailVerified true.
      if (!updatedFaculty.get('emailVerified')) {
        update.emailVerified = true;
        update.verify_at = new Date();
      }
      return DBUtil.updateFacultyById(_id, update);
    })
    .then(updatedFaculty => {
      // Return API response first.
      APIUtil.successResponse(info, updatedFaculty, res);

      if (shouldSendWelcomeEmail) {
        Mailer.send(MailType.welcome, {
          to: updatedFaculty.get('email'),
          extra: {
            name: `Dr. ${updatedFaculty.get('firstName')} ${updatedFaculty.get('lastName')}`,
          }
        })
      }
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}