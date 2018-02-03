import { Request, Response } from 'express';
const passport = require('passport');

import APIUtil from '../utils/api.util';

module.exports.login = (req: Request, res: Response, next: any) => {
  const info: any = {
    key: '/api/users/login',
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
          req.logIn(user, (err) => {
            if (err) {
              info.debugInfo.err = err;
              APIUtil.errorResponse(info, 'Failed to login. The system administrator will take a look.', {}, res);
            } else {
              APIUtil.redirectResponse(info, {
                pathname: '/dashboard',
                query: {}
              }, res);
            }
          });
        }
      });
    }
  })(req, res, next);
}

module.exports.logout = (req: Request, res: Response) => {
  const info: any = {
    key: '/api/users/logout',
    debugInfo: {}
  };

  req.logOut();

  APIUtil.redirectResponse(info, {
    pathname: '/',
    query: {}
  }, res);
}