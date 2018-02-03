import { Server } from 'next';
import { Application, Request, Response } from 'express';

import APIUtil from '../api/utils/api.util';

module.exports = (app: Server, server: Application) => {
  server.get('/users/:id', (req: Request, res: Response) => {
    const actualPage = '/users';
    const queryParams = { id: req.params.id };
    app.render(req, res, actualPage, queryParams);
  });

  server.get(
    '/dashboard', 
    (req: Request, res: Response) => {
      if (req.isAuthenticated()) {
        app.render(req, res, '/dashboard', {});
      } else {
        res.redirect('/login?message=You are not authenticated. Please login first');
      }
    }
  );

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
    // Remove the first element since it is always dashboard
    const query = url.split('/').slice(1) || [];
    let queryParams:any = { };
    if (query[0]) {
      queryParams.semester = query[0];
    }
    if (query[1]) {
      queryParams.menu = query[1];
    }

    const actualPage = '/dashboard';
    app.render(req, res, actualPage, queryParams);
  });
}