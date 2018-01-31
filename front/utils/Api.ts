const fetch = require('isomorphic-unfetch');

export default class Api {
  static async getSemesters(query: string = '') {
    return await this.get(`/api/semesters?${query}`);
  }

  static async getSample() {
    return await this.get('/api/sample');
  }

  private static async get(path: string) {
    const res = await fetch(`${this.getBackendUrl()}${path}`);
    const data = await res.json();

    return data;
  }

  private async post(url: string, body: Object = {}) {

  }

  private static getBackendUrl() {
    return process.env.BACKEND_URL;
  }
}