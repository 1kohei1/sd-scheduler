import { Application, Request, Response } from 'express';
const sampleController = require('../controllers/sample.controller');

module.exports = (server: Application) => {
  server.get('/api/sample', sampleController.sampleGet);
}