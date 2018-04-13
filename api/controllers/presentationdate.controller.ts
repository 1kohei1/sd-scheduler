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
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.updatePresentationDate = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  DBUtil.updatePresentationDateById(req.params._id, req.body)
    .then(updatedPresentationDate => {
      APIUtil.successResponse(info, updatedPresentationDate, res);
    })
    .catch(err => {
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}