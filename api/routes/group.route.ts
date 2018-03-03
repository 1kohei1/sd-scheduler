import { Application, Request, Response } from 'express';
const multer = require('multer');
const upload = multer()

const groupController = require('../controllers/group.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/groups', 
    groupController.findGroups,
  );

  server.post(
    '/api/groups',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    upload.single('groups'),
    groupController.createGroup,
  )

  server.post(
    '/api/groups/verify/:authenticationToken',
    groupController.verifyAuthenticationToken,
  )

  server.post(
    '/api/groups/:_id/verify',
    groupController.verifyAuthentication,
  )

  server.put(
    '/api/groups/:_id',
    APIUtil.verifyJWT,
    APIUtil.isAuthorizedJWT,
    groupController.updateGroup,
  )
}