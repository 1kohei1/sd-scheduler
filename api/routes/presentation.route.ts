import { Application, Request, Response } from 'express';

const presentationController = require('../controllers/presentation.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/presentations',
    presentationController.findPresentations,
  );

  server.post(
    '/api/presentations',
    APIUtil.verifyJWT,
    APIUtil.isAuthorizedJWT,
    presentationController.createPresentation,
  )

  // API route for SD admin to create presentation
  server.post(
    '/api/presentations/admin',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    presentationController.createPresentation,
  )

  // API route for SD admin to update presentation
  server.put(
    '/api/presentations/admin/:_id',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    presentationController.updatePresentation,
  )

  server.put(
    '/api/presentations/:_id',
    APIUtil.verifyJWT,
    APIUtil.isAuthorizedJWT,
    presentationController.updatePresentation,
  )

  server.delete(
    '/api/presentations/:_id',
    APIUtil.isAuthenticated,
    presentationController.deletePresentation,
  )
}