import { Request, Response } from 'express';
import * as crypt from 'crypto';

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

  DBUtil.createFaculty(req.body)
  .then(newFaculty => {
    APIUtil.successResponse(info, newFaculty, res);
    
    // Generate token and when it expires. Save them to the created faculty
    const token = crypt.randomBytes(48).toString('hex');
    const expire_at = new Date();
    expire_at.setDate(expire_at.getDate() + 7); // Set token expire in 7 days
    
    // Save these data so that we can look up.
    info.debugInfo.newFaculty_id = newFaculty.get('_id');
    info.debugInfo.token = token;

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
        token: info.debugInfo.token,
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

module.exports.updateFaculty = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      _id: req.params._id,
      body: req.body,
    }
  };
 
  DBUtil.updateFacultyById(req.params._id, req.body)
  .then(result => {
    APIUtil.successResponse(info, req.body, res);
    
    if (!req.body.emailVerified) {
      // Send email verification
    }
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
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
 
  DBUtil.updateFacultyById(req.params._id, update)
  .then(result => {
    return DBUtil.updateFacultyById(req.params._id, {
      token: '',
      expire_at: null,
      register_at: new Date(),
    });
  })
  .then(result => {
    APIUtil.successResponse(info, null, res);
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  })
}