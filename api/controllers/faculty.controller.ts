import { Request, Response } from 'express';

import APIUtil from '../utils/api.util';
import DBUtil from '../utils/db.util';

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
    
    // Generate token that expires in a week. 
    // Save them to the database
    // Send invitation email
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
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
 
  DBUtil.updateFaculty(req.params._id, req.body)
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