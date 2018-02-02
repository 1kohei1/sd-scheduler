const fetch = require('isomorphic-unfetch');

enum RequestMethod {
  GET,
  POST,
}

interface loginBody {
  email: string;
  password: string;
}

export default class Api {
  static async getSemesters(query: string = '') {
    return await this.makeRequest(RequestMethod.GET, `/api/semesters?${query}`);
  }

  static async getSample() {
    return await this.get('/api/sample');
  }

  static async login(body: loginBody) {
    return await this.makeRequest(RequestMethod.POST, `/api/users/login`, body);
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
        return Promise.resolve(res.data);
      } else {
        return Promise.reject(res.message);
      }
    } else {
      return Promise.reject('Invalid request method');
    }
  }

  private static async get(path: string) {
    const res = await fetch(`${this.getBackendUrl()}${path}`);
    const data = await res.json();

    return data;
  }

  private static async post(path: string, body: Object = {}) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const res = await fetch(`${this.getBackendUrl()}${path}`, {
      method: 'POST',
      headers: myHeaders,
      mode: 'cors',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    return data;
  }

  private static getBackendUrl() {
    return process.env.BACKEND_URL;
  }
}