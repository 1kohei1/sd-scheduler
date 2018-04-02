import TimeSlot from './TimeSlot';
import Faculty from './Faculty';

export interface Semester {
  _id: string;
  key: string;
  displayName: string;
}

export const Menus = [{
  key: 'overview',
  displayName: 'Overview',
  shouldDisplay: (user: Faculty | undefined) => {
    return true;
  }
}, {
  key: 'group',
  displayName: 'Group',
  shouldDisplay: (user: Faculty | undefined) => {
    return user && user.isAdmin;
  }
}, {
  key: 'calendar',
  displayName: 'My Calendar',
  shouldDisplay: (user: Faculty | undefined) => {
    return true;
  }
}];
