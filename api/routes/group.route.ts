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

  server.get(
    '/api/groups/:_id/isAuthenticated',
    APIUtil.verifyJWT,
    APIUtil.isAuthorizedJWT,
    groupController.isAuthenticated,
  )

  server.post(
    '/api/groups/:_id/code',
    groupController.sendCode,
  )

  server.post(
    '/api/groups/:_id/verify',
    groupController.verifyCode,
  )
}