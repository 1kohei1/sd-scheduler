import { Response } from 'express';

export default class APIUtil {
  static successResponse(info: Object, data: any, res: Response) {
    res.json({
      success: true,
      data
    })
  }

  static redirectResponse(info: Object, redirect: any, res: Response) {
    res.json({
      success: true,
      redirect,
    });
  }

  // errors are form property validation message
  static errorResponse(info: Object, message: string, errors: Object = {}, res: Response) {
    this.logError(info);
    res.json({
      success: false,
      message,
      errors
    });
  }

  private static logError(info: any) {
    console.log(`${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}