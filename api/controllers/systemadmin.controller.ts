import { Request, Response } from 'express';
import { Document } from 'mongoose';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.createGroup = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.createGroup(req.body)
    .then((newGroup: Document) => {
      APIUtil.successResponse(info, newGroup, res);
    })
    .catch(err => {
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}
