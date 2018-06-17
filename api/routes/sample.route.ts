import { Application } from 'express';
const sampleController = require('../controllers/sample.controller');

module.exports = (server: Application) => {
  server.get('/api/sample', sampleController.sampleGet);
}