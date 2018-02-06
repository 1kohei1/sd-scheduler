import { Request, Response } from 'express';

import DB from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.createFaculty = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      body: req.body,
    }
  };

  DB.createFaculty(req.body)
  .then(newFaculty => {
    APIUtil.successResponse(info, newFaculty, res);
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}