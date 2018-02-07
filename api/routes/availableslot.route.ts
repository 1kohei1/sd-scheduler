import { Application, Request, Response } from 'express';
const availableslotController = require('../controllers/availableslot.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/availableslots',
    availableslotController.findAvailableSlots,
  );
}