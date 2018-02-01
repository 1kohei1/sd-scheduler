import TimeSlot from './TimeSlot';

export interface Semester {
  _id?: string;
  key: string;
  displayName: string;
  // presentationDates is not array of interface PresentationDate for below reason.
  // When NextJS returns the initial property, it serializes the object. So on the client side, Semester.presentationDates start and end are ISO string
  presentationDates: [{
    _id: string;
    start: string;
    end: string;
  }];
  location: string;
  faculties: any[];
}

export const Menus = [{
  key: 'overview',
  displayName: 'Overview',
}, {
  key: 'calendar',
  displayName: 'My Calendar',
}];
