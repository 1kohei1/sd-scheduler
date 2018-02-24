import { Application, Request, Response } from 'express';
const presentationdateController = require('../controllers/presentationdate.controller');

module.exports = (server: Application) => {
  server.get(
    '/api/presentationdates', 
    presentationdateController.findPresentationDates
  );
}