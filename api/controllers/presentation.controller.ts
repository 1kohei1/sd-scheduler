import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';

module.exports.findPresentations = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findPresentations(req.query)
    .then(presentations => {
      APIUtil.successResponse(info, presentations, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.createPresentation = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      body: req.body,
    }
  };

  DBUtil.createPresentation(req.body)
    .then(createdPresentation => {
      APIUtil.successResponse(info, createdPresentation, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.updatePresentation = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  DBUtil.updatePresentation(req.params._id, req.body)
    .then(updatedPresentation => {
      APIUtil.successResponse(info, updatedPresentation, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}