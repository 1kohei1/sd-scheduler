import { Application } from 'express';

const presentationdateController = require('../controllers/presentationdate.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/presentationdates', 
    presentationdateController.findPresentationDates,
  );

  server.put(
    '/api/presentationdates/:_id',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    presentationdateController.updatePresentationDate,
  )
}