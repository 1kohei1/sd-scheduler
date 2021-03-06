import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil, { APIInfo } from '../utils/api.util';

module.exports.findAvailableSlots = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findAvailableSlots(req.query)
  .then(availableslots => {
    APIUtil.successResponse(info, availableslots, res);
  })
  .catch(err => {
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}

module.exports.createAvailableSlot = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      body: req.body,
    }
  };

  DBUtil.checkDuplicate(req.body.semester, req.body.faculty)
  .then(availableSlots => {
    if (availableSlots.length === 0) {
      return DBUtil.createAvailableSlots(req.body)
    } else {
      return Promise.reject({
        message: 'Combination of given semester id and faculty id already exists. System administrator will take a look',
      });
    }
  })
  .then(newAvailableSlot => {
    APIUtil.successResponse(info, newAvailableSlot, res);
  })
  .catch(err => {
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}

module.exports.updateAvailableSlot = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      _id: req.params._id,
      body: req.body,
    }
  };

  DBUtil.updateAvailalbleSlotById(req.params._id, req.body)
  .then(updateAvailableSlot => {
    APIUtil.successResponse(info, updateAvailableSlot, res);
  })
  .catch(err => {
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}