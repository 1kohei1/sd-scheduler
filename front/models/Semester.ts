export interface Semester {
  _id?: string;
  key: string;
  displayName: string;
  presentationDates: [{
    _id: string;
    // When NextJS returns the initial property, it serializes the object. So on the client side, start and end is ISO format string
    start: string;
    end: string;
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
