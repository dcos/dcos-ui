Those are all protos needed to compile
https://github.com/apache/mesos/blob/master/include/mesos/v1/master/master.proto
via `protobuf.js`.

We need to collect all of them and pass them explicitly to `pbjs`, as it does
not seem capable of resolving imports in `.proto`s.

Have a look at the scripts-section of package.json to find a task to compile a
bundle and types out of those. (currently `npm run gen:protobuf`)
