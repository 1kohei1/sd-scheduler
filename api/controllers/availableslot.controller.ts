import { Request, Response } from 'express';

import DB from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.findAvailableSlots = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DB.findAvailableSlots(req.query)
  .then(availableslots => {
    APIUtil.successResponse(info, availableslots, res);
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}