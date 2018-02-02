import Semester from '../models/Semester.model';

export default class DBUtil {
  static findSemesters(query: Object = {}) {
    return Semester.find(query);
  }
}

