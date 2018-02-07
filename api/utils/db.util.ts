const bcrypt = require('bcryptjs');

import Semester from '../models/Semester.model';
import Faculty from '../models/Faculty.model';
import AvailableSlot from '../models/AvailableSlot.model';

const updateOption = {
  runValidators: true,
  context: 'query',
}

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
    return Semester.update({ _id }, update, updateOption);
  }

  /**
   * Faculty
   */

  static findFaculties(query: Object = {}) {
    return Faculty.find(query);
  }

  static findFacultyById(_id: string | number | object) {
    return Faculty.findById(_id);
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

  /**
   * AvailableSlot
   */
  static findAvailableSlots(query: Object = {}) {
    return AvailableSlot.find(query);
  }

  // The combination of the semester and faculty should be only one
  static checkDuplicate(semesterId: string, facultyId: string) {
    return AvailableSlot.find({
      semester: semesterId,
      faculty: facultyId,
    });
  }

  static createAvailableSlots(body: any) {
    const newAvailableSlot = new AvailableSlot(body);
    return newAvailableSlot.save();
  }

  static updateAvailalbleSlotById(_id: string | number | object, update: Object) {
    return AvailableSlot.update({ _id}, update, updateOption);
  }
}

