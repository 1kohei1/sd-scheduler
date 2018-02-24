import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.findGroups = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findGroups(req.query)
  .then(groups => {
    APIUtil.successResponse(info, groups, res);
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}

module.exports.createGroup = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      body: req.body,
    }
  };

}