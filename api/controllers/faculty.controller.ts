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

      // Generate token and when it expires. Save them to the created faculty
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
    .then(result => {
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
    .then(result => {
      APIUtil.successResponse(info, true, res);
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
    .then(result => {
      APIUtil.successResponse(info, req.body, res);
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
    .then(result => {
      APIUtil.successResponse(info, true, res);
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

  const update: any = {};
  if (req.body.password) {
    update.password = req.body.password;
  } else {
    info.debugInfo.message = 'Password is not given to API';
    APIUtil.errorResponse(info, 'Password is not given to API', {}, res);
    return;
  }

  const _id = req.params._id;
  let faculty: any | undefined = undefined;

  DBUtil.findFacultyById(_id)
    .then(f => {
      if (f) {
        faculty = f.toJSON();
        return DBUtil.updateFacultyById(_id, update);
      } else {
        return Promise.reject('Specified faculty does not exist')
      }
    })
    .then(result => {
      return DBUtil.updateFacultyById(req.params._id, {
        token: '',
        expire_at: null,
        register_at: new Date(),
        // To successfully come here, they have to receive token by the email. So set emailVerified true.
        emailVerified: true,
        verify_at: new Date(),
      });
    })
    .then(result => {
      // Return API response first.
      APIUtil.successResponse(info, null, res);
      
      if (!faculty.register_at) {
        // Send welcome email
      } else {
        // Send password update nofication
      }
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })

  // DBUtil.updateFacultyById(req.params._id, update)
  //   .then(result => {
  //     return DBUtil.updateFacultyById(req.params._id, {
  //       token: '',
  //       expire_at: null,
  //       register_at: new Date(),
  //     });
  //   })
  //   // Send password update notification email
  //   .then(result => {
  //     APIUtil.successResponse(info, null, res);
  //   })
  //   .catch(err => {
  //     info.debugInfo.message = err.message;
  //     APIUtil.errorResponse(info, err.message, {}, res);
  //   })
}