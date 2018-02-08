import { Request, Response } from 'express';
import * as moment from 'moment-timezone';

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
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.updateSemester = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      _id: req.params._id,
      body: req.body,
    }
  }

  let body = req.body;
  if (body.hasOwnProperty('presentationDates')) {
    body.presentationDates.sort((a: any, b: any) => {
      return moment(a.start).valueOf() - moment(b.start).valueOf();
    })
  }

  DBUtil.updateSemesterById(req.params._id, body)
    .then(result => {
      APIUtil.successResponse(info, body, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}