import * as moment from 'moment-timezone';
import { Moment, unitOfTime } from 'moment-timezone';
import { Range } from 'immutable';

import { DateConstants } from '../models/Constants';
import TimeSlot from '../models/TimeSlot';

export interface TimeSlotLikeObject {
  _id: string;
  start: string;
  end: string;
}

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

  static smaller(m1: Moment, m2: Moment) {
    if (m1.valueOf() < m2.valueOf()) {
      return m1;
    } else {
      return m2;
    }
  }

  static larger(m1: Moment, m2: Moment) {
    if (m1.valueOf() > m2.valueOf()) {
      return m1;
    } else {
      return m2;
    }
  }

  static convertToTimeSlot(slot: TimeSlotLikeObject): TimeSlot {
    return {
      _id: slot._id,
      start: DatetimeUtil.getMomentFromISOString(slot.start),
      end: DatetimeUtil.getMomentFromISOString(slot.end),
    }
  }

  // Convert moment hour and min to number. Ex) 9:30 AM => 9.5, 10:30 PM => 22.5
  static convertToHourlyNumber(m: Moment) {
    const hour = parseInt(this.formatDate(m, 'H'));
    const min = parseInt(this.formatDate(m, 'm')) / 60;
    return hour + min;
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

  /**
   * Return true when t1 time slot range contains t2 time slot range
   */
  static doesCover(t1: TimeSlot, t2: TimeSlot) {
    if (t1._id === t2._id) {
      return false;
    }

    const t1Start = t1.start.valueOf();
    const t1End = t1.end.valueOf();
    const t2Start = t2.start.valueOf();
    const t2End = t2.end.valueOf();

    // Based on the restriction that TimeSlot.start <= TimeSlot.end
    return t1Start <= t2Start && t2End <= t1End;
  }

  static getTimeOptions(includeMin: boolean = false) {
    const ampm = ['AM', 'PM'];
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const arr: string[] = [];
    ampm.forEach(val => {
      hours.forEach(h => {
        if (includeMin) {
          arr.push(`${h}:00 ${val}`);
          arr.push(`${h}:30 ${val}`);
        } else {
          arr.push(`${h} ${val}`);
        }
      });
    });

    return arr;
  }
}