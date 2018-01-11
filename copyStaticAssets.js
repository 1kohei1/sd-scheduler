const shell = require("shelljs");

shell.mkdir("-p", ".dist/front");
shell.cp("-R", "front/static", ".dist/front/static");