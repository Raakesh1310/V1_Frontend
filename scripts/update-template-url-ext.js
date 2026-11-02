'use strict';
const path = require('path');
const sh = require('shelljs');
const renderPug = require('./render-pug');

const srcPath = path.resolve(path.dirname(__filename), '../src');

sh.find(srcPath).forEach(_processFile);

function _processFile(filePath) {
  if (filePath.match(/\.component\.ts$/)) {
    updateExtInFile(filePath);
  }
}

function checkExtStyle() {
  var isPug = false;
  for (var i = 0; i < process.argv.length; i++) {}
}

function updateExtInFile(filePath, ext) {
  var argV = process.argv.slice(2);
  console.log(JSON.stringify(argV));
  // sed('-i', '', '', filePath);
}
