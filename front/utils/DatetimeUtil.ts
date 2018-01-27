import * as moment from 'moment-timezone';
import { Moment, unitOfTime } from 'moment-timezone';
import { Range } from 'immutable';

import { DateConstants } from '../models/Constants';
import TimeSlot from '../models/TimeSlot';

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

  static formatDate(date: Moment, format: string) {
    return date.format(format);
  }

  static formatISOString(isoString: string, format: string, timezone: string = DateConstants.timezone) {
    return moment.tz(isoString, timezone).format(format);
  }

  static getMomentFromISOString(isoString: string, timezone: string = DateConstants.timezone) {
    return moment.tz(isoString, timezone);
  }

  static getISOString(date: string, hour: string, timezone: string = DateConstants.timezone) {
    return moment.tz(`${date} ${hour}`, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, timezone).toISOString();
  }

  static getMoment(date: string, hour: string, timezone: string = DateConstants.timezone) {
    return moment.tz(`${date} ${hour}`, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, timezone);
  }

  static getMomentByFormat(str: string, format: string, timezone: string = DateConstants.timezone) {
    return moment.tz(str, format, timezone);
  }

  static createHoursArray(startTime: number, endTime: number) {
    return Range(startTime, endTime).toArray();
  }

  static addToMoment(m: Moment, amount: number, unit: unitOfTime.DurationConstructor) {
    return m.clone().add(amount, unit);
  }

  static doesOverlap(t1: TimeSlot, t2: TimeSlot) {
    // If it is the same TimeSlot, return false
    if (t1._id === t2._id) {
      return false;
    }

    const start = t1.start.valueOf();
    const end = t1.end.valueOf();
    const otherStart = t2.start.valueOf();
    const otherEnd = t2.end.valueOf();

    // Logic is taken from https://github.com/rotaready/moment-range/blob/master/lib/moment-range.js#L185-L196
    if ((start <= otherStart) && (otherStart < end) && (end < otherEnd)) {
      return true;
    }
    else if ((otherStart < start) && (start < otherEnd) && (otherEnd <= end)) {
      return true;
    }
    else if ((otherStart < start) && (start <= end) && (end < otherEnd)) {
      return true;
    }
    else if ((start <= otherStart) && (otherStart <= otherEnd) && (otherEnd <= end)) {
      return true;
    } else {
      return false;
    }
  }

  static getHourOptions() {
    const ampm = ['AM', 'PM'];
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const temp = ampm.map(val => {
      return hours.map(h => `${h} ${val}`);
    });
    const hourOptions = [].concat.apply([], temp); // Taken from http://www.jstips.co/en/javascript/flattening-multidimensional-arrays-in-javascript/

    return hourOptions;
  }
}