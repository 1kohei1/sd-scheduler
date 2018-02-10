import { Request, Response } from 'express';

import Mailer, { MailType } from '../utils/mail.util';

module.exports.sampleGet = (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'hello',
  });
}