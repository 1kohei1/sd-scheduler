import TimeSlot from './TimeSlot';

export interface Semester {
  _id: string;
  key: string;
  displayName: string;
  faculties: any[];
}

export const Menus = [{
  key: 'overview',
  displayName: 'Overview',
}, {
  key: 'calendar',
  displayName: 'My Calendar',
}];
