const bcrypt = require('bcryptjs');

import Semester from '../models/Semester.model';
import Faculty from '../models/Faculty.model';

export default class DBUtil {
  /**
   * Semester
   */

  static findSemesters(query: Object = {}) {
    return Semester.find(query);
  }

  static findSemesterById(_id: string | number | object) {
    return Semester.findById(_id);
  }

  static updateSemesterById(_id: string | number | object, update: Object) {
    return Semester.findByIdAndUpdate(_id, update, {
      runValidators: true,
    });
  }

  /**
   * Faculty
   */

  static findFaculties(query: Object = {}) {
    return Faculty.find(query);
  }

  static findFacultyById(id: string | number | object) {
    return Faculty.findById(id);
  }

  static createFaculty(body: any) {
    const salt = bcrypt.genSaltSync(10);
    body.password = bcrypt.hashSync(body.password, salt);
    const newFaculty = new Faculty(body);
    
    newFaculty.set({
      register_at: new Date()
    });

    return newFaculty.save();
  }
}

