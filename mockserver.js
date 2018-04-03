#!/usr/bin/env node

var mockServer = require("mockserver-client"),
  mockServerClient = mockServer.mockServerClient;

// var mockserver = require("mockserver-node");

// if (process.argv[2] === "start") {
//   mockserver.start_mockserver({
//     serverPort: 1080,
//     proxyPort: 1090,
//     verbose: true,
//     runForked: true
//   });
// }

// if (process.argv[2] === "stop") {
//   mockserver.stop_mockserver({
//     serverPort: 1080,
//     proxyPort: 1090,
//     verbose: true
//   });
// }

const client = mockServerClient("localhost", 1080);
client.reset();
client.mockAnyResponse({
  httpRequest: {
    path: "/some/path"
  },
  httpForward: {
    host: "mock-server.com",
    port: 80,
    scheme: "HTTP"
  }
});
