const shell = require("shelljs");

shell.mkdir("-p", ".dist");
shell.cp("-R", "static", ".dist/static");