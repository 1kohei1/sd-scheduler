import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { Document } from 'mongoose';

import DBUtil from './db.util';

export interface RequestWithDecoded extends Request {
  decoded: any;
}

export default class APIUtil {
  static successResponse(info: Object, data: any, res: Response) {
    res.json({
      success: true,
      data
    })
  }

  // errors are form property validation message
  static errorResponse(info: any, message: string, errors: Object = {}, res: Response) {
    info.debugInfo.message = message;
    this.logError(info);
    res.json({
      success: false,
      message,
      errors
    });
  }

  static isAuthenticated(req: Request, res: Response, next: any) {
    const info: any = {
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
    const info: any = {
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
    const info: any = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    const authorizationHeader = req.headers['authorization'] as string;

    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            APIUtil.errorResponse(info, 'Your session expired. Please verify your identity by sending email at previous step', {}, res);
          } else {
            APIUtil.errorResponse(info, err.message, {}, res);
          }
        } else {
          req.decoded = decoded as object;
          next();
        }
      });
    } else {
      APIUtil.errorResponse(info, 'You are not authenticated. Please login first', {}, res);
    }
  }

  static isAuthorizedJWT(req: RequestWithDecoded, res: Response, next: any) {
    const info: any = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    const jwtGroupId = req.decoded.group_id;

    // Get group id of presentation
    const presentationId = req.params._id;
    let p;
    // If user is updating presentation, get group id from the database
    if (presentationId) {
      p = DBUtil.findPresentations({ _id: presentationId }, '')
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
    // If user is creating a new presentation, get group id from the requested body
    else {
      p = Promise.resolve(req.body.group);
    }

    p.then(dbGroupId => {
      if (jwtGroupId !== dbGroupId) {
        APIUtil.errorResponse(info, 'You are not authorized.', {}, res);
      } else {
        next();
      }
    })
      .catch(err => {
        APIUtil.errorResponse(info, err.message, {}, res);
      })
  }

  static isAuthenticatedCronRequest(req: Request, res: Response, next: any) {
    const info: any = {
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
    const info: any = {
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

  static logError(info: any) {
    console.log(`Error:${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}