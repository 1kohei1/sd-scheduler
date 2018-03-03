const bcrypt = require('bcryptjs');
import { Model, Document } from 'mongoose';

import Semester from '../models/Semester.model';
import Faculty from '../models/Faculty.model';
import AvailableSlot from '../models/AvailableSlot.model';
import Group from '../models/Group.model';
import PresentationDate from '../models/PresentationDate.model';
import Location from '../models/Location.model';

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
    return DBUtil.updateById(Semester, _id, update);
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

    // By default, don't include the system admin and test user
    if (!query.hasOwnProperty('isSystemAdmin')) {
      query.isSystemAdmin = false;
    }
    if (!query.hasOwnProperty('isTestUser')) {
      query.isTestUser = false;
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

    return newFaculty.save();
  }

  static updateFacultyById(_id: string | number | object, update: any) {
    if (update.hasOwnProperty('password') && update.password) {
      const salt = bcrypt.genSaltSync(10);
      update.password = bcrypt.hashSync(update.password, salt);
    }
    return DBUtil.updateById(Faculty, _id, update);
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
    return DBUtil.updateById(AvailableSlot, _id, update);
  }

  /**
   * Group
   */

  static findGroups(query: object = {}) {
    return Group.find(query).sort({
      'groupNumber': 'asc',
    });
  }

  static createGroup(body: object) {
    const newGroup = new Group(body);
    return newGroup.save();
  }

  static updateGroup(_id: string, update: object = {}) {
    return DBUtil.updateById(Group, _id, update);
  }

  /**
   * PresentationDate
   */

  static findPresentationDates(query: object = {}) {
    return PresentationDate.find(query)
      .populate('admin')
      // Didn't come up with a simple and readable way to sort by populated fieles. 
      // So resolve values and sort manually
      .then(presentationDates => {
        presentationDates.sort((a: Document, b: Document) => {
          if (a.get('admin').firstName !== b.get('admin').firstName) {
            return a.get('admin').firstName.localeCompare(b.get('admin').firstName);
          } else {
            a.get('admin').lastName.localeCompare(b.get('admin').lastName);
          }
        });
        return Promise.resolve(presentationDates);
      })
  }

  static updatePresentationDateById(_id: string | number | object, update: object = {}) {
    return DBUtil.updateById(PresentationDate, _id, update, 'admin');
  }

  /**
   * Locations
   */

  static findLocations(query: object = {}) {
    return Location.find(query)
      .populate('admin')
      // Didn't come up with a simple and readable way to sort by populated fieles. 
      // So resolve values and sort manually
      .then(locations => {
        locations.sort((a: Document, b: Document) => {
          if (a.get('admin').firstName !== b.get('admin').firstName) {
            return a.get('admin').firstName.localeCompare(b.get('admin').firstName);
          } else {
            a.get('admin').lastName.localeCompare(b.get('admin').lastName);
          }
        });
        return Promise.resolve(locations);
      });
  }

  static updateLocationById(_id: string | number | object, update: object = {}) {
    return DBUtil.updateById(Location, _id, update, 'admin');
  }

  /**
   * Private functions
   */

  private static updateById(model: Model<Document>, _id: string | number | object, update: object = {}, populate: string | object | undefined = undefined) {
    let findQ = model.findById(_id);
    if (populate) {
      findQ = findQ.populate(populate);
    }

    return findQ
      .then(doc => {
        if (doc) {
          doc.set(update);
          return doc.save();
        } else {
          return Promise.reject('Document is not found');
        }
      })
  }
}

