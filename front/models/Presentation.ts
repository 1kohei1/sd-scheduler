import ObjectID from 'bson-objectid';

import Group from './Group';
import Person, { NewPerson } from './Person';

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

export const NewPresentation = (semester: string, group: Group) => {
  return {
    _id: ObjectID.generate(),
    start: '',
    end: '',
    semester,
    projectName: '',
    sponsorName: '',
    sponsors: [NewPerson()],
    group: group,
    faculties: [
      group.adminFaculty,
    ],
    externalFaculties: [],
    midPresentationLink: '',
    committeeFormLink: '',
  };
}