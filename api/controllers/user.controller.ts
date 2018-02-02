import { Request, Response } from 'express';
const passport = require('passport');

import APIUtil from '../utils/api.util';

module.exports.login = (req: Request, res: Response, next: any) => {
  const info: any = {
    key: 'login',
    debugInfo: {}
  };

  passport.authenticate('local', (err: any, user: any) => {
    if (err) {
      info.debugInfo.err = err;
      APIUtil.errorResponse(info, 'Invalid email or password', {}, res);
    } else if (!user) {
      APIUtil.errorResponse(info, 'Invalid email or password', {}, res);
    } else {
      req.logIn(user, (err) => {
        if (err) {
          info.debugInfo.err = err;
          APIUtil.errorResponse(info, 'Invalid email or password', {}, res);
        } else {
          APIUtil.successResponse(info, null, res);
        }
      });
    }
  })(req, res, next);
}