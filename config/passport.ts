import { Authenticator } from 'passport';
import { Strategy, IVerifyOptions } from 'passport-local';
import DBUtil from '../api/utils/db.util';
import bcrypt = require('bcryptjs');

module.exports = (passport: Authenticator) => {
  passport.serializeUser(function(user: any, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    DBUtil.findFacultyById(id)
    .then(faculty => {
      if (faculty) {
        done(null, faculty);
      } else {
        done(null, undefined);
      }
    })
    .catch(err => {
      done(err);
    })
  });

  // Passport local strategy
  passport.use(new Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }, (email: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) => {
    DBUtil.findFaculties({
      emails: email
    })
    .then((faculties) => {
      if (faculties.length === 0) {
        return done(null, false, {
          message: 'Invalid email or password'
        });
      } else {
        let user = null;
        faculties.forEach((faculty) => {
          const isMatch = bcrypt.compareSync(password, faculty.get('password'));
          if (isMatch) {
            user = faculty;
          }
        });
        
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid email or password'
          });
        }
      }
    })
    .catch(err => {
      throw err;
    })
  }));
}

