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
}