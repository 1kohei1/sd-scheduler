// If not production environment, load the environment specific value from .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
import { Application, Request, Response } from 'express';
import { Server } from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app: Server = next({ dir: './front', dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    // Connect to DB
    mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('open', () => {
      console.log('> connected to DB');
    })

    const server: Application = express();

    // Set up API routes
    require('./api/routes/index.route')(server);

    // Set up client side custom routes
    require('./front/custom-routes')(app, server);

    server.get('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(3000, (err: Error) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    })
  })
  .catch((ex: Error) => {
    console.error(ex.stack);
    process.exit(1);
  });
