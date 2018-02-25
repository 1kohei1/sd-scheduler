import { Application, Request, Response } from 'express';

const locationController = require('../controllers/location.controller');
import APIUtil from '../utils/api.util';

module.exports = (server: Application) => {
  server.get(
    '/api/locations',
    locationController.findLocations,
  );

  server.put(
    '/api/locations/:_id',
    locationController.updateLocation,
  )
}