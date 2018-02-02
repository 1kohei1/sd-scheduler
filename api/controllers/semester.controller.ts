import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.findSemesters = (req: Request, res: Response) => {
  const info: any = {
    key: 'find_semesters',
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