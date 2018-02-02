import Semester from '../models/Semester.model';
import Faculty from '../models/Faculty.model';

export default class DBUtil {
  static findSemesters(query: Object = {}) {
    return Semester.find(query);
  }

  static findSemesterById(id: string | number | object) {
    return Semester.findById(id);
  }

  static findFaculties(query: Object = {}) {
    return Faculty.find(query);
  }

  static findFacultyById(id: string | number | object) {
    return Faculty.findById(id);
  }
}

