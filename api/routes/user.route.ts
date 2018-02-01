import { Application, Request, Response } from 'express';
const authController = require('../controllers/user.controller');

module.exports = (server: Application) => {
  server.get('/api/auth/login', );
}