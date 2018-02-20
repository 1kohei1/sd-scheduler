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

  static getFaculties(props: InitialProps, defaultValue: string[] = []) {
    let faculties = defaultValue;

    const ids = Cookie.get(FACULTY_COOKIE_KEY);
    if (props.req) {
      const cookies = CookieParser.parse(props.req.headers.cookie as string);
      if (cookies[FACULTY_COOKIE_KEY]) {
        faculties = cookies[FACULTY_COOKIE_KEY].split(',');
      }
    } else if (ids) {
      faculties = ids.split(',');
    }

    return faculties;
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