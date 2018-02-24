import { Application, Request, Response } from 'express';

const groupController = require('../controllers/group.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/groups', 
    groupController.findGroups,
  );

  server.post(
    '/api/groups',
    groupController.createGroup,
  )
}