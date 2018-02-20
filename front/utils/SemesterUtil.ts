import * as moment from 'moment-timezone';
import { Menus } from '../models/Semester';

export default class SemesterUtil {
  private static startYear = 2017;
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
  private static isValidYear(year: string | undefined) {
    if (!year) return false;
    const numYear = parseInt(year);
    return !isNaN(numYear) && SemesterUtil.startYear <= numYear && numYear <= SemesterUtil.currentYear();
  }

  private static isValidSeason(season: string | undefined | null) {
    if (!season) return false;
    return ['spring', 'summer', 'fall'].includes(season.toLowerCase());
  }

  static defaultMenu = 'overview';

  static defaultSemester() {
    return `${SemesterUtil.currentYear()}_${SemesterUtil.currentSeason()}`;
  }

  static isValidSemester(semester: string | undefined) {
    if (!semester) return false;
    let year, season;
    [year, season] = semester.split('_');

    return SemesterUtil.isValidYear(year) && SemesterUtil.isValidSeason(season);
  }

  static isValidMenu(menu: string | undefined | null) {
    if (!menu) return false;
    return Menus.map(menu => menu.key).includes(menu.toLowerCase());
  }
}