import { Application, Request, Response } from 'express';

module.exports = (server: Application) => {
  require('./sample.route')(server);
  require('./user.route')(server);
  require('./semester.route')(server);
  require('./faculty.route')(server);
}