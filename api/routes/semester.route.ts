import { Application, Request, Response } from 'express';

const semesterController = require('../controllers/semester.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/semesters', 
    semesterController.findSemesters,
  );

  server.put(
    '/api/semesters/:_id',
    APIUtil.isAuthenticated,
    APIUtil.isAuthorized,
    semesterController.updateSemester,
  )
}