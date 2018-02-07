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

module.exports.createAvailableSlot = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      body: req.body,
    }
  };

  DB.checkDuplicate(req.body.semester, req.body.faculty)
  .then(availableSlots => {
    if (availableSlots.length === 0) {
      return DB.createAvailableSlots(req.body)
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
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}

module.exports.updateAvailableSlot = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id,
      _id: req.params._id,
      body: req.body,
    }
  };

  DB.updateAvailalbleSlotById(req.params._id, req.body)
  .then(result => {
    APIUtil.successResponse(info, {}, res);
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    APIUtil.errorResponse(info, err.message, {}, res);
  });
}