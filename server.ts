const express = require('express');
const next = require('next');
import { Application, Request, Response } from 'express';
import { Server } from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app:Server = next({ dir: './front', dev });
const handle = app.getRequestHandler();

app.prepare()
.then(() => {
  const server: Application = express();

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
