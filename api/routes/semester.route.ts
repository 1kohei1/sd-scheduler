import { Application, Request, Response } from 'express';
const sampleController = require('../controllers/semester.controller');

module.exports = (server: Application) => {
  server.get('/api/semesters', sampleController.findSemesters);
}