import * as Cookie from 'js-cookie';
import * as CookieParser from 'cookie';

import InitialProps from '../models/InitialProps';
import Faculty from '../models/Faculty';

const FACULTY_COOKIE_KEY = 'faculties';
const USER_COOKIE_KEY = 'user';

export default class CookieUtil {

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