import { Request, Response } from 'express';

module.exports.sampleGet = (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'hello',
  });
}