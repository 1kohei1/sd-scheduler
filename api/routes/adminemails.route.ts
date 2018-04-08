import { Application, Request, Response } from 'express';
const adminemailsController = require('../controllers/adminemails.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {

  // This route is to let SD2 faculty to send emails
  // So routes are out of REST rules
  
  server.post(
    '/api/adminemails',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    adminemailsController.send,
  )

  server.get(
    '/api/adminemails/terms',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    adminemailsController.getTerms,
  );
  
  server.post(
    '/api/adminemails/preview',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    adminemailsController.preview,
  );
}