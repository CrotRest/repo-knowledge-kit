const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { isPathInside, writeGeneratedFiles } = require("../src/cli");

test("isPathInside accepts nested repository paths", () => {
  const root = path.resolve("/tmp/repo");

  assert.equal(isPathInside(root, path.join(root, "AGENTS.md")), true);
  assert.equal(isPathInside(root, path.join(root, ".codex", "workflows", "review.md")), true);
});

test("isPathInside rejects traversal outside the repository root", () => {
  const root = path.resolve("/tmp/repo");

  assert.equal(isPathInside(root, path.resolve(root, "..", "outside.md")), false);
});

test("writeGeneratedFiles refuses to overwrite unless forced", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rkk-"));
  writeGeneratedFiles(dir, { "AGENTS.md": "first" }, false);

  assert.throws(
    () => writeGeneratedFiles(dir, { "AGENTS.md": "second" }, false),
    /Refusing to overwrite/
  );
});

test("writeGeneratedFiles refuses to write outside repository root", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rkk-"));

  assert.throws(
    () => writeGeneratedFiles(dir, { "../outside.md": "bad" }, true),
    /outside repository root/
  );
});
