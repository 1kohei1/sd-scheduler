import * as moment from 'moment-timezone';
import { Document } from 'mongoose';

export default class Util {
  static siteUrl() {
    return process.env.NODE_ENV === 'production' ? process.env.SITE_PRODUCTION_URL : process.env.SITE_DEVELOPMENT_URL;
  }

  static currentSemesterKey() {
    return `${Util.currentYear()}_${Util.currentSeason()}`;
  }

  private static currentYear() {
    return moment().year();
  }
  private static currentSeason() {
    const month = moment().month() + 1;
    if (1 <= month && month <= 5) {
      return 'spring';
    } else if (month <= 8) {
      return 'summer';
    } else {
      return 'fall';
    }
  }

  static doesOverlap(d1: Document, d2: Document) {
    if (d1.get('_id') === d2.get('_id')) {
      return false;
    }

    const start = d1.get('start').valueOf();
    const end = d1.get('end').valueOf();
    const otherStart = d2.get('start').valueOf();
    const otherEnd = d2.get('end').valueOf();

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
}