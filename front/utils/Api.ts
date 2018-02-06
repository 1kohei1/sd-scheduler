const fetch = require('isomorphic-unfetch');
import Router from 'next/router';

enum RequestMethod {
  GET,
  POST,
}

interface loginBody {
  email: string;
  password: string;
}

export default class Api {
  static async getUser() {
    return await this.makeRequest(RequestMethod.GET, '/api/users');
  }

  static async getSemesters(query: string = '') {
    return await this.makeRequest(RequestMethod.GET, `/api/semesters?${query}`);
  }

  static async getSample() {
    return await this.get('/api/sample');
  }

  static async login(body: loginBody) {
    return await this.makeRequest(RequestMethod.POST, `/api/users/login`, body);
  }

  static async logout() {
    return await this.makeRequest(RequestMethod.POST, '/api/users/logout');
  }

  private static async makeRequest(method: RequestMethod, path: string, body: Object = {}) {
    let res;
    if (method === RequestMethod.GET) {
      res = await this.get(path);
    } else if (method === RequestMethod.POST) {
      res = await this.post(path, body);
    }

    if (res) {
      if (res.success) {
        if (res.hasOwnProperty('redirect')) {
          Router.push({
            pathname: res.redirect.pathname,
            query: res.redirect.query
          });
        } else {
          return Promise.resolve(res.data);
        }
      } else {
        return Promise.reject(res);
      }
    } else {
      return Promise.reject('Invalid request method');
    }
  }

  private static async get(path: string) {
    const res = await fetch(`${this.getBackendUrl()}${path}`, {
      method: 'GET',
      credentials: 'same-origin',
    });
    const data = await res.json();

    return data;
  }

  private static async post(path: string, body: Object = {}) {
    const res = await fetch(`${this.getBackendUrl()}${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    return data;
  }

  static getBackendUrl() {
    return process.env.BACKEND_URL;
  }
}