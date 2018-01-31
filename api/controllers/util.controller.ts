import { Response } from 'express';

export default class Util {
  static successResponse(info: Object, data: any, res: Response) {
    res.json({
      success: true,
      data
    })
  }

  static errorResponse(info: Object, message: string, res: Response) {
    this.logError(info);
    res.json({
      success: false,
      message
    });
  }

  private static logError(info: any) {
    console.log(`${info.key}: ${JSON.stringify(info.debugInfo)}`);
  }
}