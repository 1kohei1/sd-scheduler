import { Application, Request, Response } from 'express';
const userController = require('../controllers/user.controller');
const passport = require('passport');

module.exports = (server: Application) => {
  server.post(
    '/api/users/login',
    userController.login
  );

  server.post(
    '/api/users/logout',
    passport.authorize('local'),
    userController.logout
  )
}
