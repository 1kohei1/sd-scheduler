import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

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
    if (req.isAuthenticated()) {
      next();
    } else {
      APIUtil.errorResponse({}, 'You are not authenticated. Please login first', {}, res);
    }
  }

  static isAuthorized(req: Request, res: Response, next: any) {
    if (req.user.isAdmin) {
      next();
    } else {
      APIUtil.errorResponse({}, 'You are not authorized to make this action', {}, res);
    }
  }

  static verifyJWT(req: Request, res: Response, next: any) {
    const authorizationHeader = req.headers['authorization'] as string;

    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            APIUtil.errorResponse({}, 'Your session expired. Please verify your identity by sending email at previous step', {}, res);
          } else {
            APIUtil.errorResponse({}, err.message, {}, res);
          }
        } else {
          next();
        }
      });
    } else {
      APIUtil.errorResponse({}, 'You are not authenticated. Please login first', {}, res);
    }
  }

  static key(req: Request) {
    return `[${req.method}] ${req.url}`;
  }

  static logError(info: any) {
    console.log(`Error:${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}