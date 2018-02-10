import { Request, Response } from 'express';

import Mailer, { MailType } from '../utils/mail.util';

module.exports.sampleGet = (req: Request, res: Response) => {
  Mailer.send(MailType.invitation, {
    to: 'tobecomebig@gmail.com',
    extra: {
      fromWhom: `Dr. Mark Heinrich`,
      token: 'abc',
    }
  })
  .then(info => {
    console.log(info)
  })
  .catch(err => {
    console.log(err);
  })

  return res.json({
    success: true,
    message: 'hello',
  });
}