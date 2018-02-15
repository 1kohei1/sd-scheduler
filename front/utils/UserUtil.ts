import * as Cookie from 'js-cookie';
import Router from 'next/router';

import Api from './Api';
import Faculty from '../models/Faculty';
import InitialProps from '../models/InitialProps';

const KEY = 'user';

interface onUserUpdates {
  [key: string]: ((user: Faculty | undefined) => void);
}

export default class UserUtil {
  static onUserUpdates: onUserUpdates = {};

  static async getUser() {
    let user = UserUtil.getUserFromCookie() as Faculty;

    if (user) {
      return user;
    } else {
      user = await Api.getUser();
      UserUtil.setUserToCookie(user);
      return user;
    }
  }

  static async logout() {
    const result = await Api.logout();
    Cookie.remove('user');

    const keys = Object.keys(UserUtil.onUserUpdates);
    keys.forEach(key => {
      UserUtil.onUserUpdates[key](undefined);
    });

    if (result) {
      Api.redirect(undefined, '/login', {
        message: 'You are successfully logged out',
      });
    }
  }

  static async checkAuthentication(context: InitialProps) {
    let cookie = '';
    if (context.req) {
      cookie = context.req.headers.cookie as string;
    }
    
    const user = await Api.getUser(cookie);

    if (!user) {
      const query: any = {
        err: 'You are not authenticated. Please login first',
        pathname: context.pathname,
        query: JSON.stringify(context.query),
      };
      if (context.asPath) {
        query.asPath = context.asPath;
      }
      Api.redirect(context, '/login', query);
    }
  }

  static async updateUser() {
    const user = await Api.getUser();

    const keys = Object.keys(UserUtil.onUserUpdates);
    keys.forEach(key => {
      UserUtil.onUserUpdates[key](user);
    });
  }

  static registerOnUserUpdates(key: string, fn: (user: Faculty | undefined) => void) {
    if (!UserUtil.onUserUpdates.hasOwnProperty(key)) {
      UserUtil.onUserUpdates[key] = fn;
    }
  }

  static removeOnUserUpdates(key: string) {
    delete UserUtil.onUserUpdates[key];
  }

  private static getUserFromCookie() {
    return Cookie.getJSON(KEY);
  }

  private static setUserToCookie(user: Faculty) {
    Cookie.set(KEY, user);
  }
}