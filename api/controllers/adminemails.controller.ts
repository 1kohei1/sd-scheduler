import { Request, Response } from 'express';

import DBUtil from '../utils/db.util';
import APIUtil, { APIInfo } from '../utils/api.util';
import Mailer, { MailTemplate, MailType } from '../utils/mail.util';

module.exports.findEmails = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      userid: req.user._id,
      query: req.query,
    }
  };
  
  DBUtil.findEmails(req.query)
  .then(emails => {
    APIUtil.successResponse(info, emails, res);
  })
  .catch(err => {
    APIUtil.errorResponse(info, err.message, {}, res);
  })
}

module.exports.send = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      userid: req.user._id,
      body: req.body,
    }
  };

  const { body } = req;
  if (!body.to || body.to.length === 0 || !body.title || !body.content) {
    APIUtil.errorResponse(info, 'Please provide all necessary information', undefined, res);
  } else {
    const mailOption = {
      to: body.to,
      extra: {
        title: body.title,
        content: body.content,
      },
      sent_by: req.user._id,
    }
    Mailer.send(MailType.adminemail, mailOption);
    APIUtil.successResponse(info, {}, res);
  }
}

module.exports.getTerms = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      userid: req.user._id,
    }
  };

  APIUtil.successResponse(info, MailTemplate.terms(), res);
}

module.exports.preview = (req: Request, res: Response) => {
  const info: APIInfo = {
    key: APIUtil.key(req),
    debugInfo: {
      userid: req.user._id,
      body: req.body,
    }
  };
  
  const { content } = req.body;
  const emailHtml = MailTemplate.adminemailHtml({
    to: ['dummy@dummy.com'],
    extra: {
      content,
    }
  });

  APIUtil.successResponse(info, emailHtml, res);
}