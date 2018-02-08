import { Request, Response } from 'express';

import APIUtil from '../utils/api.util';
import DBUtil from '../utils/db.util';

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
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}