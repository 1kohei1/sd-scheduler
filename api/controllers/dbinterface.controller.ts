import Semester from '../models/Semester.model';

export default class DBInterface {
  static getSemesters(query: Object = {}) {
    return Semester.find(query);
  }
}

