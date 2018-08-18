import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { Document } from 'mongoose';

import DBUtil from './db.util';

export interface RequestWithDecoded extends Request {
  decoded: any;
}

export interface APIInfo {
  key: string;
  debugInfo: any;
}

export default class APIUtil {
  static successResponse(info: APIInfo, data: any, res: Response) {
    res.json({
      success: true,
      data
    })
  }

  // errors are form property validation message
  static errorResponse(info: APIInfo, message: string, errors: Object = {}, res: Response) {
    info.debugInfo.message = message;
    this.logError(info);
    res.json({
      success: false,
      message,
      errors
    });
  }

  static isAuthenticated(req: Request, res: Response, next: any) {
    const info: APIInfo = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    if (req.isAuthenticated()) {
      next();
    } else {
      APIUtil.errorResponse(info, 'You are not authenticated. Please login first', {}, res);
    }
  }

  static isAuthorized(req: Request, res: Response, next: any) {
    const info: APIInfo = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    if (req.user.isAdmin || req.user.isSystemAdmin) {
      next();
    } else {
      APIUtil.errorResponse(info, 'You are not authorized to make this action', {}, res);
    }
  }

  static verifyJWT(req: RequestWithDecoded, res: Response, next: any) {
    const info: APIInfo = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    const authorizationHeader = req.headers['authorization'] as string;
    const token = authorizationHeader ? authorizationHeader.split(' ')[1] : undefined;

    if (token && token !== 'undefined') {
      verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            APIUtil.errorResponse(info, 'Your token expired. Please verify your belonging to the group.', {}, res);
          } else {
            APIUtil.errorResponse(info, err.message, {}, res);
          }
        } else {
          req.decoded = decoded as object;
          next();
        }
      });
    } else {
      APIUtil.errorResponse(info, 'You are not authenticated. Please verify your belonging to the group first', {}, res);
    }
  }

  static isAuthorizedJWT(req: RequestWithDecoded, res: Response, next: any) {
    const info: APIInfo = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    const _id = req.params._id;
    const isPresentation = req.path.indexOf('presentations') >= 0;

    let p;

    if (isPresentation) {
      // If the requested API is presentation and contains _id,
      // It's updating existing presentation.
      // So get group from the database
      if (_id) {
        p = DBUtil.findPresentations({ _id }, '')
          .then((presentations: Document[], ) => {
            if (presentations.length === 0) {
              return Promise.reject({
                message: 'Specified presentation does not exist',
              })
            } else {
              return Promise.resolve(presentations[0].get('group').toString());
            }
          })
      }
      // If it is presentations API, but no specified id,
      // It's creating a new presentation. So body.group is the group of the presentation
      else {
        p = Promise.resolve(req.body.group);
      }
    }
    // If it's not presentations API, it's group API. So just use params _id
    else {
      p = Promise.resolve(_id);
    }

    const jwtGroupId = req.decoded.group_id;

    p.then(dbGroupId => {
      if (jwtGroupId !== dbGroupId) {
        APIUtil.errorResponse(info, 'You are not authorized to do action to the specified group.', {}, res);
      } else {
        next();
      }
    })
      .catch(err => {
        APIUtil.errorResponse(info, err.message, {}, res);
      })
  }

  static isAuthenticatedCronRequest(req: Request, res: Response, next: any) {
    const info: APIInfo = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    if (req.params.cron_key === process.env.CRON_KEY) {
      next();
    } else {
      APIUtil.errorResponse(info, 'Your cron key is incorrect', {}, res);
    }
  }

  static isSystemAdmin(req: Request, res: Response, next: any) {
    const info: APIInfo = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    if (req.user.isSystemAdmin) {
      next();
    } else {
      APIUtil.errorResponse(info, 'You are not system administrator', {}, res);
    }
  }

  static key(req: Request) {
    return `[${req.method}] ${req.url}`;
  }

  static logError(info: APIInfo) {
    console.log(`Error:${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}