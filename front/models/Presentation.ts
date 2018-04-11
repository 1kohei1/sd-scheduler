import Group from './Group';
import Person from './Person';
import ObjectID from 'bson-objectid';

export default interface Presentation {
  _id: string;
  start: string;
  end: string;
  semester: string; // This property will not be populated on the server side
  projectName: string;
  sponsorName: string;
  sponsors: Person[];
  group: Group;
  faculties: string[]; // This property will not be populated on the server side
  externalFaculties: Person[];
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
    projectName: '',
    sponsorName: '',
    sponsors: [],
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