import { Application, Request, Response } from 'express';
const facultyController = require('../controllers/faculty.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/faculties',
    facultyController.findFaculty,
  );
  
  server.post(
    '/api/faculties',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    facultyController.createFaculty,
  );

  server.post(
    '/api/faculties/password',
    facultyController.sendPasswordResetEmail,
  )

  server.put(
    '/api/faculties/:_id',
    APIUtil.isAuthenticated,
    facultyController.updateFaculty,
  );

  server.put(
    '/api/faculties/:_id/admin',
    APIUtil.isAuthenticated,
    APIUtil.isSystemAdmin,
    facultyController.updateFaculty,
  )

  server.post(
    '/api/faculties/:_id/verify',
    APIUtil.isAuthenticated,
    facultyController.verify,
  )

  server.put(
    '/api/faculties/:_id/:token',
    facultyController.updatePassword,
  )
}