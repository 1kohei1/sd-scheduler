import * as moment from 'moment-timezone';

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
}