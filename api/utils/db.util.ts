import Semester from '../models/Semester.model';

export default class DBUtil {
  static getSemesters(query: Object = {}) {
    return Semester.find(query);
  }
}

