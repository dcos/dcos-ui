#!/usr/bin/env node
/**
 * Inserts a purified css block for the loading animation into index.html.
 * We need this to be able to display a spinner while our assets are downloaded and processed.
 */

const fs = require("fs");
const purify = require("purify-css");

function inlineBootstrapCss(cssFileName, htmlFileName) {
  const cssFileContents = fs.readFileSync(cssFileName, "utf8");
  const htmlFileContents = fs.readFileSync(htmlFileName, "utf8");

  const insertionTag = "</head>";
  const insertionPos = htmlFileContents.indexOf(insertionTag);

  return (
    htmlFileContents.slice(0, insertionPos) +
    "<style type='text/css'>" +
    purify(htmlFileContents, cssFileContents, { minify: true }) +
    "</style>" +
    htmlFileContents.slice(insertionPos)
  );
}

fs.writeFileSync(
  process.argv[2],
  inlineBootstrapCss(process.argv[3], process.argv[2])
);
