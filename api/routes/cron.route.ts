import { Application, Request, Response } from 'express';
const cronController = require('../controllers/cron.controller');

import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {

  // There should be a better way to check if this is authenticated cron request.
  // But I didn't come up with a good way so, let's just pass the key in the URL

  server.post(
    '/api/crons/:cron_key/reminder',
    APIUtil.isAuthenticatedCronRequest,
    cronController.presentationReminder,
  );
  
  server.post(
    '/api/crons/:cron_key/no_scheduling_groups',
    APIUtil.isAuthenticatedCronRequest,
    cronController.remindToSchedule,
  )
}