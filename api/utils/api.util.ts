import { Request, Response } from 'express';

export default class APIUtil {
  static successResponse(info: Object, data: any, res: Response) {
    res.json({
      success: true,
      data
    })
  }

  static redirectResponse(info: Object, redirect: any, res: Response) {
    res.json({
      success: true,
      redirect,
    });
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
      APIUtil.redirectResponse({}, {
        pathname: '/login',
        query: {
          message: 'You are not authenticated. Please login first'
        },
      }, res);
    }
  }

  static isAuthorized(req: Request, res: Response, next: any) {
    if (req.user.isAdmin) {
      next();
    } else {
      APIUtil.errorResponse({}, 'You are not authorized to make this action', {}, res);
    }
  }

  static key(req: Request) {
    return `[${req.method}] ${req.url}`;
  }

  private static logError(info: any) {
    console.log(`${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}