import { Authenticator } from 'passport';
import { Strategy, IVerifyOptions } from 'passport-local';

module.exports = (passport: Authenticator) => {
  // Passport local strategy
  passport.use(new Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }, (email: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) => {
    console.log(email);
    console.log(password);
    return done(null, {});
  }));
}

