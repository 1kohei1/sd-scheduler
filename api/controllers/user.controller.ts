import { Request, Response } from 'express';
const passport = require('passport');

import APIUtil from '../utils/api.util';

module.exports.getUser = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {}
  };
  
  APIUtil.successResponse(info, req.user, res);
}

module.exports.login = (req: Request, res: Response, next: any) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      email: req.body.email,
    }
  };

  passport.authenticate('local', (err: any, user: any) => {
    if (err) {
      info.debugInfo.err = err;
      APIUtil.errorResponse(info, 'Invalid email or password', {}, res);
    } else if (!user) {
      info.debugInfo.err = 'No user found';
      APIUtil.errorResponse(info, 'Invalid email or password', {}, res);
    } else {
      req.logIn(user, (err) => {
        if (err) {
          info.debugInfo.err = err;
          APIUtil.errorResponse(info, 'Invalid email or password', {}, res);
        } else {
          APIUtil.successResponse(info, true, res);
        }
      });
    }
  })(req, res, next);
}

module.exports.logout = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      userId: req.user._id
    }
  };

  req.logOut();

  APIUtil.successResponse(info, true, res);
}