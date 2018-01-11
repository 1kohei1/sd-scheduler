const shell = require("shelljs");

shell.mkdir("-p", ".dist/front");
shell.cp("-R", "static", ".dist/front/static");