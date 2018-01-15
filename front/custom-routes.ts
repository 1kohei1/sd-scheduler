import { Server } from 'next';
import { Application, Request, Response } from 'express';

module.exports = (app: Server, server: Application) => {
  server.get('/p/:id', (req: Request, res: Response) => {
    const actualPage = '/post';
    const queryParams = {id: req.params.id};
    app.render(req, res, actualPage, queryParams);
  });

  server.get('/users/:id', (req: Request, res: Response) => {
    const actualPage = '/users';
    const queryParams = { id: req.params.id };
    app.render(req, res, actualPage, queryParams);
  });

  server.get('/dashboard/*', (req: Request, res: Response) => {
    let url = req.url;
    // Remove the first slash and the last slash
    if (url.charAt(0) === '/') {
      url = url.substring(1);
    }
    if (url.charAt(url.length - 1) === '/') {
      url = url.substring(0, url.length - 1);
    }
    // Convert to query. Validation for the value happens on the client side
    const query = url.split('/').slice(1) || [];
    let queryParams:any = { };
    if (query[0]) {
      queryParams.year = query[0];
    }
    if (query[1]) {
      queryParams.season = query[1];
    }
    if (query[2]) {
      queryParams.menu = query[2];
    }

    const actualPage = '/dashboard';
    app.render(req, res, actualPage, queryParams);
  });
}