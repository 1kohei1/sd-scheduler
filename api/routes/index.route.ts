import { Application, Request, Response } from 'express';

module.exports = (server: Application) => {
  const normalizedPath = require("path").join(__dirname);

  const files: string[] = [];
  require("fs").readdirSync(normalizedPath).forEach(function (file: string) {
    const arr = file.split('.');
    const fileName = `./${arr[0]}.route`;

    if (!files.includes(fileName) && !fileName.includes('index')) {
      console.log(`Loading ${fileName}`);
      require(fileName)(server);
      files.push(fileName);
    }
  });
}