import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.findSemesters = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {}
  };

  DBUtil.findSemesters()
    .then(semesters => {
      APIUtil.successResponse(info, semesters, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, 'Failed to retrieve semesters', {}, res);
    });
}

module.exports.updateSemester = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
    }
  }

  DBUtil.updateSemesterById(req.params._id, req.body)
    .then(semester => {
      APIUtil.successResponse(info, {}, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}