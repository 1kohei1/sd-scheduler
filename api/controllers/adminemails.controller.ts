import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';
import Mailer, { MailTemplate } from '../utils/mail.util';

module.exports.send = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      body: req.body,
    }
  };
  
}

module.exports.getTerms = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
    }
  };

  APIUtil.successResponse(info, MailTemplate.terms(), res);
}

module.exports.preview = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      body: req.body,
    }
  };
  
}