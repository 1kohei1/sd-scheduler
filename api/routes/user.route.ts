import { Application, Request, Response } from 'express';
const userController = require('../controllers/user.controller');
const passport = require('passport');
import { Strategy, IVerifyOptions } from 'passport-local';

module.exports = (server: Application) => {
  server.post(
    '/api/users/login',
    passport.authenticate('local'),
    userController.login
  );
}

// Passport local strategy
passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) => {
  console.log(email);
  console.log(password);
  return done(null, {});
}));