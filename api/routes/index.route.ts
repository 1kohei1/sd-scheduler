import { Application, Request, Response } from 'express';

module.exports = (server: Application) => {
  require('./sample.route')(server);
  require('./auth.route')(server);
}