import { Request, Response } from 'express';

import DBInterface from './dbinterface.controller';
import Util from './util.controller';

module.exports.getSemesters = (req: Request, res: Response) => {
  const info: any = {
    key: 'get_semesters',
    debugInfo: {}
  };

  DBInterface.getSemesters()
  .then(semesters => {
    Util.successResponse(info, semesters, res);
  })
  .catch(err => {
    info.debugInfo.message = err.message;
    Util.errorResponse(info, 'Failed to retrieve semesters', res);
  });
}