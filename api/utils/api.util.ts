import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

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
  static errorResponse(info: Object, message: string, errors: Object = {}, res: Response) {
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
      info.debugInfo.message = 'You are not authenticated. Please login first';
      APIUtil.errorResponse(info, 'You are not authenticated. Please login first', {}, res);
    }
  }

  static isAuthorized(req: Request, res: Response, next: any) {
    const info: any = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    if (req.user.isAdmin) {
      next();
    } else {
      info.debugInfo.message = 'You are not authorized to make this action';
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
            info.debugInfo.message = 'Your session expired. Please verify your identity by sending email at previous step';
            APIUtil.errorResponse(info, 'Your session expired. Please verify your identity by sending email at previous step', {}, res);
          } else {
            info.debugInfo.message = err.message;
            APIUtil.errorResponse(info, err.message, {}, res);
          }
        } else {
          req.decoded = decoded as object;
          next();
        }
      });
    } else {
      info.debugInfo.message = 'You are not authenticated. Please login first';
      APIUtil.errorResponse(info, 'You are not authenticated. Please login first', {}, res);
    }
  }

  static isAuthorizedJWT(req: RequestWithDecoded, res: Response, next: any) {
    const info: any = {
      key: APIUtil.key(req),
      debugInfo: {
      }
    };

    const urlArray = req.url.split('/');
    const resource = req.url[2];

    const jwtGroupId = req.decoded.group_id;
    let resourceGroupIdPromise = Promise.resolve(undefined);

    if (resource === 'groups') {
      resourceGroupIdPromise = Promise.resolve(req.params._id);
    } else if (resource === 'presentations') {
      if (req.body.group) {
        resourceGroupIdPromise = Promise.resolve(req.body.group);
      } else if (req.params._id) {
        resourceGroupIdPromise = DBUtil.findPresentations({
          _id: req.params._id,
        })
          .then(presentations => {
            const presentation = presentations[0];
            if (presentation) {
              return Promise.resolve(presentation.get('group'));
            } else {
              return Promise.resolve(undefined);
            }
          })
      }
    }

    resourceGroupIdPromise
      .then(resourceGroupId => {
        if (jwtGroupId !== resourceGroupId) {
          info.debugInfo.message = 'You are not authorized.'
          APIUtil.errorResponse(info, 'You are not authorized.', {}, res);
        } else {
          next();
        }
      })
  }

  static key(req: Request) {
    return `[${req.method}] ${req.url}`;
  }

  static logError(info: any) {
    console.log(`Error:${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}