import { Request, Response } from 'express';
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

  let token: string | undefined = undefined;

  DBUtil.createFaculty(req.body)
    .then(newFaculty => {
      APIUtil.successResponse(info, newFaculty, res);

      // Generate token. Save them to the created faculty
      token = crypto.randomBytes(48).toString('hex');
      const expire_at = new Date();
      expire_at.setDate(expire_at.getDate() + 7); // Set token expire in 7 days

      // Save these data so that we can look up.
      info.debugInfo._id = newFaculty.get('_id');

      return DBUtil.updateFacultyById(newFaculty.get('_id'), {
        token,
        expire_at,
      });
    })
    .then(updatedFaculty => {
      // Send invitation email
      Mailer.send(MailType.invitation, {
        to: req.body.email,
        extra: {
          fromWhom: `Dr. ${req.user.firstName} ${req.user.lastName}`,
          token,
        }
      })
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      if (res.headersSent) {
        APIUtil.logError(info);
      } else {
        APIUtil.errorResponse(info, err.message, {}, res);
      }
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

  let faculty: any = null;
  let token: string | undefined = undefined;

  DBUtil.findFaculties({ email })
    .then(faculties => {
      if (!faculties || faculties.length === 0) {
        return Promise.reject({
          message: 'No user is found',
        });
      }

      faculty = faculties[0];

      token = crypto.randomBytes(48).toString('hex');
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
    })
    .then(result => {
      Mailer.send(MailType.passwordreset, {
        to: email,
        extra: {
          name: `Dr. ${faculty.firstName} ${faculty.lastName}`,
          token,
        }
      });
    })
    .catch(err => {
      let message = '';
      if (err.message) {
        message = err.message;
        info.debugInfo.message = err.message;
      } else {
        message = 'Failed to send password reset email. System administrator will take a look';
        info.debugInfo.err = err;
      }
      APIUtil.errorResponse(info, message, {}, res);
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

  let faculty: any | undefined = undefined;
  let token: string | undefined = undefined;
  const sendVerify = req.body.hasOwnProperty('emailVerified') && !req.body.emailVerified;

  DBUtil.findFacultyById(req.params._id)
    .then(f => {
      if (!f) {
        return Promise.reject({
          message: 'Specified faculty does not exist',
        })
      } else {
        faculty = f.toJSON();
        if (sendVerify) {
          token = crypto.randomBytes(48).toString('hex');;
          req.body.verifyToken = token;
        }
        return DBUtil.updateFacultyById(req.params._id, req.body);
      }
    })
    .then(updatedFaculty => {
      APIUtil.successResponse(info, updatedFaculty, res);
      Mailer.send(MailType.verify, {
        to: faculty.email,
        extra: {
          name: `Dr. ${faculty.firstName} ${faculty.lastName}`,
          token,
        }
      });
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

  const _id = req.params._id;
  const token = crypto.randomBytes(48).toString('hex');
  let faculty: any | undefined = undefined;

  DBUtil.findFacultyById(_id)
    .then(f => {
      if (f) {
        faculty = f.toJSON();
        return DBUtil.updateFacultyById(_id, {
          verifyToken: token,
        });
      } else {
        return Promise.reject({
          message: 'Specified faculty does not exist',
        });
      }
    })
    .then(updatedFaculty => {
      APIUtil.successResponse(info, updatedFaculty, res);
      Mailer.send(MailType.verify, {
        to: faculty.email,
        extra: {
          name: `Dr. ${faculty.firstName} ${faculty.lastName}`,
          token,
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