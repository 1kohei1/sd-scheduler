import * as Cookie from 'js-cookie';
import * as CookieParser from 'cookie';

import InitialProps from '../models/InitialProps';
import Faculty from '../models/Faculty';

const USER_COOKIE_KEY = 'user';
const TOKEN_COOKIE_KEY = 'token';

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

  static setToken(token: string) {
    Cookie.set(TOKEN_COOKIE_KEY, token);
  }

  static getToken() {
    return Cookie.get(TOKEN_COOKIE_KEY);
  }
}