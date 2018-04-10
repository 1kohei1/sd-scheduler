const fetch = require('isomorphic-unfetch');
import Router from 'next/router';

import InitialProps from '../models/InitialProps';
import CookieUtil from '../utils/CookieUtil';

enum RequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
}

interface loginBody {
  email: string;
  password: string;
}

export default class Api {
  static async getSample() {
    return await Api.makeRequest(RequestMethod.GET, '/api/sample');
  }

  /**
   * User
   */

  static async getUser(cookie: string = '') {
    return await Api.makeRequest(RequestMethod.GET, '/api/users', {}, cookie);
  }


  static async login(body: loginBody) {
    return await Api.makeRequest(RequestMethod.POST, `/api/users/login`, body);
  }

  static async logout() {
    return await Api.makeRequest(RequestMethod.POST, '/api/users/logout');
  }

  /**
   * Semester
   */

  static async getSemesters(query: string = '') {
    return await Api.makeRequest(RequestMethod.GET, `/api/semesters?${query}`);
  }

  static async updateSemester(_id: string, update: Object = {}) {
    return await Api.makeRequest(RequestMethod.PUT, `/api/semesters/${_id}`, update);
  }

  /**
   * AvailableSlot
   */

  static async getAvailableSlots(query: string = '') {
    return await Api.makeRequest(RequestMethod.GET, `/api/availableslots?${query}`);
  }

  static async createAvailableSlot(body: Object) {
    return await Api.makeRequest(RequestMethod.POST, `/api/availableslots`, body);
  }

  static async updateAvailableSlot(_id: string, update: Object = {}) {
    return await Api.makeRequest(RequestMethod.PUT, `/api/availableslots/${_id}`, update);
  }

  /**
   * Faculty
   */

  static async getFaculties(query: string = '') {
    return await Api.makeRequest(RequestMethod.GET, `/api/faculties?${query}`);
  }

  static async getAllFaculties() {
    const f1 = await Api.makeRequest(RequestMethod.GET, `/api/faculties?isTestUser=true&isSystemAdmin=true`);
    const f2 = await Api.makeRequest(RequestMethod.GET, `/api/faculties?isTestUser=true&isSystemAdmin=false`);
    const f3 = await Api.makeRequest(RequestMethod.GET, `/api/faculties?isTestUser=false&isSystemAdmin=true`);
    const f4 = await Api.makeRequest(RequestMethod.GET, `/api/faculties?isTestUser=false&isSystemAdmin=false`);
    return f1.concat(f2, f3, f4);
  }

  static async createFaculty(body: object = {}) {
    return await Api.makeRequest(RequestMethod.POST, `/api/faculties`, body);
  }

  static async updateFaculty(_id: string, update: object = {}) {
    return await Api.makeRequest(RequestMethod.PUT, `/api/faculties/${_id}`, update);
  }

  static async updateFacultyAdminState(_id: string, update: object = {}) {
    return await Api.makeRequest(RequestMethod.PUT, `/api/faculties/${_id}/admin`, update);
  }

  static async updateFacultyByToken(_id: string, token: string, update: object = {}) {
    return await Api.makeRequest(RequestMethod.PUT, `/api/faculties/${_id}/${token}`, update);
  }

  static async sendPasswordreset(body: object = {}) {
    return await Api.makeRequest(RequestMethod.POST, '/api/faculties/password', body);
  }

  static async sendVerify(_id: string) {
    return await Api.makeRequest(RequestMethod.POST, `/api/faculties/${_id}/verify`);
  }

  /**
   * Group
   */

  static async getGroups(query: string = '') {
    return await Api.makeRequest(RequestMethod.GET, `/api/groups?${query}`);
  }

  static async verifyStudentIdentity(_id: string, body: object) {
    return await Api.makeRequest(RequestMethod.POST, `/api/groups/${_id}/verify`, body);
  }

  static async verifyGroupAuthenticationToken(authenticationToken: string) {
    return await Api.makeRequest(RequestMethod.POST, `/api/groups/verify/${authenticationToken}`);
  }

  static async updateGroup(_id: string, body: object) {
    return await Api,this.makeRequest(RequestMethod.PUT, `/api/groups/${_id}`, body);
  }

  /**
   * PresentationDate
   */

  static async getPresentationDates(query: string = '') {
    return await Api.makeRequest(RequestMethod.GET, `/api/presentationdates?${query}`);
  }

  static async updatePresentationDate(_id: string, update: object = {}) {
    return await Api.makeRequest(RequestMethod.PUT, `/api/presentationdates/${_id}`, update);
  }

  /**
   * Presentation
   */

   static async getPresentations(query: string = '') {
     return await Api.makeRequest(RequestMethod.GET, `/api/presentations?${query}`);
   }

   static async createPresentation(body: object = {}) {
     return await Api.makeRequest(RequestMethod.POST, `/api/presentations`, body);
   }

   static async updatePresentation(_id: string, update: object) {
     return await Api.makeRequest(RequestMethod.PUT, `/api/presentations/${_id}`, update);
   }

   static async cancelPresentation(_id: string, body: object) {
    return await Api.makeRequest(RequestMethod.DELETE, `/api/presentations/${_id}`, body);
   }

   /**
    * adminemails
    */

    static async getEmails(query: string = '') {
      return await Api.makeRequest(RequestMethod.GET, `/api/adminemails?${query}`);
    }

    static async getTerms() {
      return await Api.makeRequest(RequestMethod.GET, `/api/adminemails/terms`);
    }

    static async getPreview(body: object) {
      return await Api.makeRequest(RequestMethod.POST, `/api/adminemails/preview`, body);
    }

    static async sendAdminemail(body: object) {
      return await Api.makeRequest(RequestMethod.POST, `/api/adminemails`, body);
    }

  /**
   * Utility functions
   */

  static redirect(context: InitialProps | undefined, path: string, query: { [key: string]: string } = {}, asPath?: string) {
    if (context && context.res) {
      const queryString = Object.entries(query).map(([key, val]) => `${key}=${val}`).join('&');
      context.res.writeHead(302, {
        Location: `${path}?${queryString}`,
      });
      context.res.end();
    } else {
      const option: any = {
        pathname: path,
        query,
      }
      Router.push(option, asPath);
    }
  }

  static getBackendUrl() {
    return process.env.BACKEND_URL;
  }

  /**
   * Private functions
   */

  private static async makeRequest(method: RequestMethod, path: string, body: Object = {}, cookie: string = '') {
    let res = await fetch(
      `${Api.getBackendUrl()}${path}`,
      Api.fetchOption(method, body, cookie),
    )
    res = await res.json();

    if (res) {
      if (res.success) {
        return Promise.resolve(res.data);
      } else {
        return Promise.reject(res);
      }
    } else {
      return Promise.reject('Invalid request method');
    }
  }

  private static fetchOption(method: RequestMethod, body: Object = {}, cookie: string = '') {
    let requestMethod = '';
    if (method === RequestMethod.GET) {
      requestMethod = 'GET';
    } else if (method === RequestMethod.POST) {
      requestMethod = 'POST';
    } else if (method === RequestMethod.PUT) {
      requestMethod = 'PUT';
    } else if (method === RequestMethod.DELETE) {
      requestMethod = 'DELETE';
    }

    let obj: any = {
      method: requestMethod,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CookieUtil.getToken()}`,
      }
    };

    if (cookie) {
      obj.headers.Cookie = cookie;
    }

    if (Object.keys(body).length > 0) {
      obj.body = JSON.stringify(body);
    }
    return obj;
  }
}