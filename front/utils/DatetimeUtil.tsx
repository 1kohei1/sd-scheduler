import { Moment } from 'moment-timezone';
import { Range } from 'immutable';

export default class DatetimeUtil {
  static convertTo12Hr(hour: number) {
    if (hour < 12) {
      return `${hour}am`;
    } else if (hour === 12) {
      return `${hour}pm`;
    } else {
      return `${hour - 12}pm`;
    }
  }

  static convertToFormat(date: Moment, format: string) {
    return date.format(format);
  }

  static createHoursArray(startTime: number, endTime: number) {
    return Range(startTime, endTime + 1).toArray();
  }
}