import { Request, Response } from 'express';

import APIUtil from '../utils/api.util';
import DBUtil from '../utils/db.util';

module.exports.findPresentationDates = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findPresentationDates(req.query)
    .then(presentationDates => {
      APIUtil.successResponse(info, presentationDates, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}
