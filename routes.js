module.exports = (app, server) => {
  server.get('/p/:id', (req, res) => {
    const actualPage = '/post';
    const queryParams = {id: req.params.id};
    app.render(req, res, actualPage, queryParams);
  });

  server.get('/users/:id', (req, res) => {
    const actualPage = '/users';
    const queryParams = { id: req.params.id };
    app.render(req, res, actualPage, queryParams);
  });
}