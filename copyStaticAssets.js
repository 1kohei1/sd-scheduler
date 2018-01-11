const shell = require("shelljs");

shell.mkdir("-p", ".dist/static");
shell.cp("-R", "static", ".dist/static");