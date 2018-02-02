import { Application, Request, Response } from 'express';
const userController = require('../controllers/user.controller');
const passport = require('passport');

module.exports = (server: Application) => {
  server.post(
    '/api/users/login',
    passport.authenticate('local'),
    userController.login
  );
}
