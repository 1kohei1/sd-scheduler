import { Request, Response } from 'express';

module.exports.login = (req: Request, res: Response) => {
  res.redirect('/dashboard');
}