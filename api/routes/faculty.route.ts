import { Application, Request, Response } from 'express';
const facultyController = require('../controllers/faculty.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.post(
    '/api/faculties',
    APIUtil.isAuthenticated,
    facultyController.createFaculty
  );
}