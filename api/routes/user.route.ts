import { Application, Request, Response } from 'express';
const userController = require('../controllers/user.controller');
const passport = require('passport');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.post(
    '/api/users/login',
    userController.login
  );

  server.post(
    '/api/users/logout',
    APIUtil.isAuthenticated,
    userController.logout
  )
}
