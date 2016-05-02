/*
  Set proxy options

  Copy this file to proxy.dev.js within this directory and customize proxy
  options. By default, webpack will look for proxy.dev.js first and fallback
  on this. proxy.dev.js is not tracked by git.
 */
module.exports = {
  '*': 'http://m1.dcos'
};
