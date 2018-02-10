const fetch = require('isomorphic-unfetch');
import Router from 'next/router';

import InitialProps from '../models/InitialProps';

enum RequestMethod {
  GET,
  POST,
  PUT,
}

interface loginBody {
  email: string;
  password: string;
}

export default class Api {
  static async getSample() {
    return await this.makeRequest(RequestMethod.GET, '/api/sample');
  }

  /**
   * User
   */

  static async getUser() {
    return await this.makeRequest(RequestMethod.GET, '/api/users');
  }


  static async login(body: loginBody) {
    return await this.makeRequest(RequestMethod.POST, `/api/users/login`, body);
  }

  static async logout() {
    return await this.makeRequest(RequestMethod.POST, '/api/users/logout');
  }

  /**
   * Semester
   */

  static async getSemesters(query: string = '') {
    return await this.makeRequest(RequestMethod.GET, `/api/semesters?${query}`);
  }

  static async updateSemester(_id: string, update: Object = {}) {
    return await this.makeRequest(RequestMethod.PUT, `/api/semesters/${_id}`, update);
  }

  /**
   * AvailableSlot
   */

  static async getAvailableSlots(query: string = '') {
    return await this.makeRequest(RequestMethod.GET, `/api/availableslots?${query}`);
  }

  static async createAvailableSlot(body: Object) {
    return await this.makeRequest(RequestMethod.POST, `/api/availableslots`, body);
  }

  static async updateAvailableSlot(_id: string, update: Object = {}) {
    return await this.makeRequest(RequestMethod.PUT, `/api/availableslots/${_id}`, update);
  }

  /**
   * Faculty
   */

  static async getFaculties(query: string = '') {
    return await this.makeRequest(RequestMethod.GET, `/api/faculties?${query}`);
  }

  static async createFaculty(body: object = {}) {
    return await this.makeRequest(RequestMethod.POST, `/api/faculties`, body);
  }

  static async updateFaculty(_id: string, update: object = {}) {
     return await this.makeRequest(RequestMethod.PUT, `/api/faculties/${_id}`, update);
   }

  /**
   * Utility functions
   */

  static redirect(context: InitialProps | undefined, path: string, query: {[key: string]: string} = {}) {
    if (context && context.res) {
      const queryString = Object.entries(query).map(([key, val]) => `${key}=${val}&`);
      context.res.writeHead(302, {
        Location: `${path}?${queryString}`,
      });
      context.res.end();
    } else {
      Router.push({
        pathname: path,
        query,
      });
    }
  }

  static getBackendUrl() {
    return process.env.BACKEND_URL;
  }

  /**
   * Private functions
   */

  private static async makeRequest(method: RequestMethod, path: string, body: Object = {}) {
    let res = await fetch(
      `${this.getBackendUrl()}${path}`,
      Api.fetchOption(method, body),
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

  private static fetchOption(method: RequestMethod, body: Object = {}) {
    let requestMethod = '';
    if (method === RequestMethod.GET) {
      requestMethod = 'GET';
    } else if (method === RequestMethod.POST) {
      requestMethod = 'POST';
    } else if (method === RequestMethod.PUT) {
      requestMethod = 'PUT';
    }

    let obj: any = {
      method: requestMethod,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (Object.keys(body).length > 0) {
      obj.body = JSON.stringify(body);
    }
    return obj;
  }
}