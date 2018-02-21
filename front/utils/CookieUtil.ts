import * as Cookie from 'js-cookie';
import * as CookieParser from 'cookie';

import InitialProps from '../models/InitialProps';
import Faculty from '../models/Faculty';

const FACULTY_COOKIE_KEY = 'faculties';
const USER_COOKIE_KEY = 'user';

export default class CookieUtil {

  /**
   * index page faculties filter
   */

  static getFaculties() {
    const vals = Cookie.get(FACULTY_COOKIE_KEY);
    if (vals) {
      return vals.split(',');
    } else {
      undefined;
    }
  }

  static setFaculties(ids: string[]) {
    Cookie.set(FACULTY_COOKIE_KEY, ids.join(','));
  }

  /**
   * user info cookie
   */

  static getUser(defaultValue: undefined = undefined) {
    let user: object | undefined = defaultValue;

    if (Cookie.getJSON(USER_COOKIE_KEY)) {
      user = Cookie.getJSON(USER_COOKIE_KEY);
    }

    return user;
  }

  static setUser(user: Faculty) {
    Cookie.set(USER_COOKIE_KEY, user);
  }

  static removeUser() {
    Cookie.remove(USER_COOKIE_KEY);
  }
}