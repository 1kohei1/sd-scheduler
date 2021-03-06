// If not production environment, load the environment specific value from .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const next = require('next');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
import { Application, Request, Response } from 'express';
import { Server } from 'next';
import * as http from 'http';
import * as express from 'express';
import SocketIOUtil from './api/utils/socketio.util';

const dev = process.env.NODE_ENV !== 'production';
const app: Application = express();
const server = new http.Server(app);
const nextApp: Server = next({ dir: './front', dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare()
  .then(() => {
    // Connect to DB
    mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('open', () => {
      console.log('> connected to DB');
    })

    app.set('trust proxy', 1); // https://github.com/expressjs/session#cookiesecure

    // Set up to parse POST body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    // Set up session configuration
    // The default server-side session storage, MemoryStore, is purposely not designed for a production environment.
    // However in this app, the number of session would be at most 20, so it's ok to use MemoryState
    const option: any = {
      cookie: {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 60 * 1000, // Set cookie expire in 60 days
        secure: process.env.NODE_ENV === 'production' ? true : false,
      },
      resave: true,
      saveUninitialized: true,
      secret: process.env.SECRET, // Used this website: https://www.random.org/strings/
    }
    if (process.env.NODE_ENV === 'production') {
      option.store = new MongoStore({
        mongooseConnection: mongoose.connection,
      });
    }
    app.use(session(option));

    // Set up passport
    app.use(passport.initialize());
    app.use(passport.session());
    require('./config/passport')(passport);

    // Set up API routes
    require('./api/routes/index.route')(app);

    // Set up client side custom routes
    require('./front/custom-routes')(nextApp, app);

    app.get('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    // Set socketio
    SocketIOUtil.setIO(server);

    server.listen(3000, (err: Error) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    })
  })
  .catch((ex: Error) => {
    console.error(ex.stack);
    process.exit(1);
  });
