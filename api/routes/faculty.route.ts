import { Application, Request, Response } from 'express';
const passport = require('passport');
const facultyController = require('../controllers/faculty.controller');

module.exports = (server: Application) => {
  server.post(
    '/api/faculties',
    passport.authorize('local'),
    facultyController.createFaculty
  );
}