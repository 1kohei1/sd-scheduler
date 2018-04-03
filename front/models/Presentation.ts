import Group from './Group';
import ObjectID from 'bson-objectid';

export interface ExternalFaculty {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default interface Presentation {
  _id: string;
  start: string;
  end: string;
  semester: string; // This property will not be populated on the server side
  group: Group;
  faculties: string[]; // This property will not be populated on the server side
  externalFaculties: ExternalFaculty[];
  midPresentationLink: string;
  committeeFormLink: string;
  created_at?: Date;
  updated_at?: Date;
}

export const newPresentation = (semester: string) => {
  return {
    _id: ObjectID.generate(),
    start: '',
    end: '',
    semester,
    group: {
      _id: ObjectID.generate(),
      projectName: '',
      semester,
      members: [],
      sponsors: [],
      sponsorName: '',
      groupNumber: 0,
      adminFaculty: '',
    },
    faculties: [],
    externalFaculties: [],
    midPresentationLink: '',
    committeeFormLink: '',
  };
}