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
    presentationController.createPresentation,
  )

  server.put(
    '/api/presentations/:_id',
    APIUtil.verifyJWT,
    presentationController.updatePresentation,
  )
}