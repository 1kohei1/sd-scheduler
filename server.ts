const express = require('express');
const next = require('next');
import { Request, Response } from 'express';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
.then(() => {
  const server = express();

  require('./routes')(app, server);

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
