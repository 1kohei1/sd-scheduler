const bcrypt = require('bcryptjs');

import Semester from '../models/Semester.model';
import Faculty from '../models/Faculty.model';
import AvailableSlot from '../models/AvailableSlot.model';
import Group from '../models/Group.model';

const updateOption = {
  runValidators: true,
  context: 'query',
}

export default class DBUtil {
  /**
   * Semester
   */

  static findSemesters(query: Object = {}) {
    return Semester.find(query).sort({
      'created_at': 'desc',
    });
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

  static findFaculties(query: any = {}, shouldIncludePassword: boolean = false) {
    const password = shouldIncludePassword ? '+password' : '';
    // Ignore case sensitivity for the email property
    if (query.hasOwnProperty('email') && typeof query.email === 'string') {
      query.email = query.email.toLowerCase();
    }
    return Faculty.find(query, password).sort({
      'firstName': 'asc',
      'lastName': 'asc',
    });
  }

  static findFacultyById(_id: string | number | object, shouldIncludePassword: boolean = false) {
    const password = shouldIncludePassword ? '+password' : '';
    return Faculty.findById(_id, password);
  }

  static createFaculty(body: any) {
    if (body.password) {
      const salt = bcrypt.genSaltSync(10);
      body.password = bcrypt.hashSync(body.password, salt);
    }
    const newFaculty = new Faculty(body);

    // Would like not to include password field. Research how to omit the field in save() callback
    return newFaculty.save();
  }

  static updateFacultyById(_id: string | number | object, update: any) {
    if (update.hasOwnProperty('password') && update.password) {
      const salt = bcrypt.genSaltSync(10);
      update.password = bcrypt.hashSync(update.password, salt);
    }
    return Faculty.update({ _id }, update, updateOption);
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
    return AvailableSlot.update({ _id }, update, updateOption);
  }

  /**
   * Group
   */

   static findGroups(query: object = {}) {
     return Group.find(query);
   }
}

