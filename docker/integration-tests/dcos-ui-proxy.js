var compression = require('compression');
var express = require('express');
var fs = require('fs');
var proxyMiddleware = require('http-proxy-middleware');

// Normalize
var APPLICATION_CONFIGURATION = JSON.stringify(JSON.parse(process.env.APPLICATION_CONFIGURATION));
var indexContents = fs.readFileSync('./dist/index.html', 'utf8');
indexContents = indexContents.replace(
  /(<\/head>)/,
  '<script type="text/javascript">var APPLICATION_CONFIGURATION = \'' +
    APPLICATION_CONFIGURATION + '\';</script> $1'
);
fs.writeFileSync('./dist/index.html', indexContents, 'utf8');

var options = {
  target: process.env.CLUSTER_ADDRESS,
  secure: false
};

var filter = function (pathname, req) {
    return true;
};

var app = express();
app.use(compression());
app.use(express.static('dist'));
app.use('/', proxyMiddleware(filter, options));
app.listen(4200);
