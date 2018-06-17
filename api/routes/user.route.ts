import { Application } from 'express';
const userController = require('../controllers/user.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/users',
    userController.getUser
  )
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
