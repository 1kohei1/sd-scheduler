export default class Util {
  static siteUrl() {
    return process.env.NODE_ENV === 'production' ? process.env.SITE_PRODUCTION_URL : process.env.SITE_DEVELOPMENT_URL;
  }
  
}