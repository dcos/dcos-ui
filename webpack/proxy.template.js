/*
  Set proxy options
 */
module.exports = {
  /*
   * Develop on the mesos ui with dcos ui
   *
   * 1. Uncomment the following section
   * 2. Clone the mesos repository referenced in the mesos package locally:
   *    https://github.com/dcos/dcos/blob/master/packages/mesos/buildinfo.json#L6
   * 3. Checkout the branch referenced in the mesos package:
   *    https://github.com/dcos/dcos/blob/master/packages/mesos/buildinfo.json#L8
   * 4. Navigate to src/webui/master and run 'python -m SimpleHTTPServer' to
   *    host that folder on localhost:8000 (target should point to this host)
   * 5. Restart the docs-ui server and when navigating to /mesos you should see
   *    your local ui
   */
  // '/mesos/static/*': {
  //   target: 'http://127.0.0.1:8000',
  //   rewrite: function (req) {
  //     // Remove '/mesos' from the beginning of the url
  //     req.url = req.url.replace(/^\/mesos/, '');
  //   }
  // },
  "*": "http://m1.dcos"
};
