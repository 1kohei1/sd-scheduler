import { Application, Request, Response } from 'express';
const cronController = require('../controllers/cron.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.post(
    '/api/crons/reminder',
    cronController.presentationReminder,
  );
  
  server.post(
    '/api/crons/no_scheduling_groups',
    cronController.remindToSchedule,
  )
}