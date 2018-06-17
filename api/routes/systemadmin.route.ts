import { Application } from 'express';

const systemadminController = require('../controllers/systemadmin.controller');
const facultyController = require('../controllers/faculty.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.post(
    '/api/systemadmin/groups',
    APIUtil.isAuthenticated,
    APIUtil.isSystemAdmin,
    systemadminController.createGroup,
  );

  server.put(
    '/api/systemadmin/faculties/:_id',
    APIUtil.isAuthenticated,
    APIUtil.isSystemAdmin,
    facultyController.updateFaculty,
  )
}