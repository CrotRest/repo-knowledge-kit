const fs = require("node:fs");
const path = require("node:path");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeTextFile(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text, "utf8");
}

function readTextFile(file) {
  return fs.readFileSync(file, "utf8");
}

function fileExists(file) {
  return fs.existsSync(file);
}

module.exports = {
  ensureDir,
  fileExists,
  readTextFile,
  writeTextFile
};
