import { Request, Response } from 'express';

import DB from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.createFaculty = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {}
  };

  DB.createFaculty(req.body)
  .then(newFaculty => {
    APIUtil.successResponse(info, newFaculty, res);
  })
  .catch(err => {
    info.debugInfo.err = err;
    APIUtil.errorResponse(info, 'Failed to create faculty. The system admin will look the log.', {}, res);
  });
}