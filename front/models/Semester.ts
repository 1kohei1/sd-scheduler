export interface Semester {
  _id?: string;
  key: string;
  displayName: string;
  dates: [{
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    [key: string]: string;
  }]
}

export const Menus = [{
  key: 'overview',
  displayName: 'Overview'
}, {
  key: 'availability',
  displayName: 'My Availability'
}, {
  key: 'schedule',
  displayName: 'My Schedule'
}];
