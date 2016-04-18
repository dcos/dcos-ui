/* eslint-disable */
module.exports.schema = {
  "additionalProperties" : false,
  "description" : "Marathon DC/OS Service properties",
  "properties" : {
    "application" : {
      "additionalProperties" : false,
      "description" : "Marathon app configuration properties.",
      "properties" : {
        "id" : {
          "description" : "The ID of this Marathon application inside DC/OS base Marathon.",
          "type" : "string"
        },
        "cpus" : {
          "default" : 2,
          "description" : "CPU shares to allocate to each Marathon instance.",
          "minimum" : 0,
          "type" : "number"
        },
        "mem" : {
          "default" : 1536,
          "description" : "Memory (MB) to allocate to each Marathon instance.",
          "minimum" : 512,
          "type" : "number"
        },
        "instances" : {
          "default" : 1,
          "description" : "Number of Marathon instances to run.",
          "minimum" : 0,
          "type" : "integer"
        },
        "uris" : {
          "default" : [ ],
          "description" : "List of URIs that will be downloaded and made available in the current working directory of Marathon. For example this can be used to download a Java keystore file for SSL configuration.",
          "items" : {
            "pattern" : "^[\\s]+",
            "type" : "string"
          },
          "type" : "array"
        }
      },
      "required" : [ "cpus", "mem", "instances" ],
      "type" : "object"
    },
    "jvm" : {
      "additionalProperties" : false,
      "description" : "JVM configuration properties",
      "properties" : {
        "heap-min" : {
          "default" : 256,
          "description" : "Memory (MB) start size for the JVM heap. This number should be be less or equals than the heap-max.",
          "minimum" : 0,
          "type" : "integer"
        },
        "heap-max" : {
          "default" : 768,
          "description" : "Memory (MB) max size for the JVM heap. This number should be less than the memory allocated to the Marathon instance (General rule: 50%).",
          "minimum" : 0,
          "type" : "integer"
        }
      },
      "required" : [ "heap-min", "heap-max" ],
      "type" : "object"
    },
    "marathon" : {
      "additionalProperties" : true,
      "description" : "Marathon command line flags. These are the same flags that are passed through to Marathon when launching manually from the command line. See details here: https://mesosphere.github.io/marathon/docs/command-line-flags.html",
      "properties" : {
        "access-control-allow-origin" : {
          "description" : "The origin(s) to allow in Marathon. Not set by default. Example values are \"*\", or \"http://localhost:8888, http://domain.com\"",
          "type" : "string"
        },
        "artifact-store" : {
          "description" : "URL to the artifact store. Supported store types hdfs, file. Example: hdfs://localhost:54310/path/to/store, file:///var/log/store",
          "type" : "object",
          "properties": {
            "nestedThing": {
              "type": "string",
              "description": "something nested"
            }
          }
        },
        "assets-path" : {
          "description" : "Set a local file system path to load assets from, instead of loading them from the packaged jar.",
          "type" : "string"
        },
        "checkpoint" : {
          "description" : "Enabled: (Default) Enable checkpointing of tasks. Requires checkpointing enabled on slaves. Allows tasks to continue running during mesos-slave restarts and upgrades Disabled: Disable checkpointing of tasks.",
          "type" : "boolean",
          "default" : true
        },
        "decline-offer-duration" : {
          "description" : "(Default: 120 seconds) The duration (milliseconds) for which to decline offers by default",
          "type" : "integer",
          "default" : 120000
        },
        "default-accepted-resource-roles" : {
          "description" : "Default for the defaultAcceptedResourceRoles attribute of all app definitions as a comma-separated list of strings. This defaults to all roles for which this Marathon instance is configured to receive offers.",
          "type" : "string"
        },
        "disable-http" : {
          "description" : "Disable listening for HTTP requests completely. HTTPS is unaffected.",
          "type" : "boolean",
          "default" : false
        },
        "env-vars-prefix" : {
          "description" : "Prefix to use for environment variables injected automatically into all started tasks.",
          "type" : "string"
        },
        "event-stream-max-outstanding-messages" : {
          "description" : "The event stream buffers events, that are not already consumed by clients. This number defines the number of events that get buffered on the server side, before messages are dropped.",
          "type" : "integer",
          "default" : 50
        },
        "event-subscriber" : {
          "description" : "The event subscription module to use. E.g. http_callback.",
          "type" : "string"
        },
        "executor" : {
          "description" : "Executor to use when none is specified. If not defined the Mesos command executor is used by default.",
          "type" : "string",
          "default" : "//cmd"
        },
        "failover-timeout" : {
          "description" : "(Default: 1 week) The failover_timeout for mesos in seconds.",
          "type" : "integer",
          "default" : 604800
        },
        "framework-name" : {
          "description" : "Framework name to register with Mesos.",
          "type" : "string",
          "default" : "marathon-user"
        },
        "ha" : {
          "description" : "Enabled: (Default) Run Marathon in HA mode with leader election. Allows starting an arbitrary number of other Marathons but all need to be started in HA mode. This mode requires a running ZooKeeper Disabled: Run Marathon in single node mode.",
          "type" : "boolean",
          "default" : true
        },
        "hostname" : {
          "description" : "The advertised hostname that is used for the communication with the Mesos master. The value is also stored in the persistent store so another standby host can redirect to the elected leader.",
          "type" : "string"
        },
        "http-address" : {
          "description" : "The address to listen on for HTTP requests",
          "type" : "string"
        },
        "http-credentials" : {
          "description" : "Credentials for accessing the http service. If empty, anyone can access the HTTP endpoint. A username:password pair is expected where the username must not contain ':'. May also be specified with the `MESOSPHERE_HTTP_CREDENTIALS` environment variable. ",
          "type" : "string"
        },
        "http-endpoints" : {
          "description" : "The URLs of the event endpoints added to the current list of subscribers on startup. You can manage this list during runtime by using the /v2/eventSubscriptions API endpoint.",
          "type" : "string"
        },
        "http-event-callback-slow-consumer-timeout" : {
          "description" : "A http event callback consumer is considered slow, if the delivery takes longer than this timeout (ms)",
          "type" : "integer",
          "default" : 10000
        },
        "http-max-concurrent-requests" : {
          "description" : "The number of concurrent HTTP requests that are allowed before rejecting.",
          "type" : "integer"
        },
        "http-port" : {
          "description" : "The port to listen on for HTTP requests",
          "type" : "integer",
          "default" : 0
        },
        "http-realm" : {
          "description" : "The security realm (aka 'area') associated with the credentials",
          "type" : "string",
          "default" : "Mesosphere"
        },
        "https-address" : {
          "description" : "The address to listen on for HTTPS requests.",
          "type" : "string"
        },
        "https-port" : {
          "description" : "The port to listen on for HTTPS requests",
          "type" : "integer",
          "default" : 0
        },
        "launch-token-refresh-interval" : {
          "description" : "The interval (ms) in which to refresh the launch tokens to --launch_token_count",
          "type" : "integer",
          "default" : 30000
        },
        "launch-tokens" : {
          "description" : "Launch tokens per interval",
          "type" : "integer",
          "default" : 100
        },
        "leader-proxy-connection-timeout" : {
          "description" : "Maximum time, in milliseconds, to wait for connecting to the current Marathon leader from another Marathon instance.",
          "type" : "integer",
          "default" : 5000
        },
        "leader-proxy-read-timeout" : {
          "description" : "Maximum time, in milliseconds, for reading from the current Marathon leader.",
          "type" : "integer",
          "default" : 10000
        },
        "local-port-max" : {
          "description" : "Max port number to use when assigning globally unique service ports to apps.",
          "type" : "integer",
          "default" : 20000
        },
        "local-port-min" : {
          "description" : "Min port number to use when assigning globally unique service ports to apps.",
          "type" : "integer",
          "default" : 10000
        },
        "logging-level" : {
          "description" : "Set logging level to one of: off, error, warn, info, debug, trace, all",
          "type" : "string"
        },
        "marathon-store-timeout" : {
          "description" : "(deprecated) Maximum time, in milliseconds, to wait for persistent storage operations to complete. This option is no longer used and will be removed in a later release.",
          "type" : "integer"
        },
        "master" : {
          "description" : "The URL of the Mesos master",
          "type" : "string",
          "default" : "zk://master.mesos:2181/mesos"
        },
        "max-apps" : {
          "description" : "The maximum number of applications that may be created.",
          "type" : "integer"
        },
        "max-tasks-per-offer" : {
          "description" : "Maximum tasks per offer. Do not start more than this number of tasks on a single offer.",
          "type" : "integer",
          "default" : 1
        },
        "mesos-authentication-principal" : {
          "description" : "Mesos Authentication Principal.",
          "type" : "string"
        },
        "mesos-authentication-secret-file" : {
          "description" : "Mesos Authentication Secret.",
          "type" : "string"
        },
        "mesos-leader-ui-url" : {
          "description" : "The host and port (e.g. \"http://mesos_host:5050\") of the Mesos master.",
          "type" : "string",
          "default" : "/mesos"
        },
        "mesos-role" : {
          "description" : "Mesos role for this framework. If set, Marathon receives resource offers for the specified role in addition to resources with the role designation '*'.",
          "type" : "string"
        },
        "mesos-user" : {
          "description" : "Mesos user for this framework.",
          "type" : "string"
        },
        "metrics" : {
          "description" : "Enabled: (Default) Enable metric measurement of service method calls. Disabled: Disable metric measurement of service method calls.",
          "type" : "boolean",
          "default" : true
        },
        "min-revive-offers-interval" : {
          "description" : "Do not ask for all offers (also already seen ones) more often than this interval (ms).",
          "type" : "integer",
          "default" : 5000
        },
        "offer-matching-timeout" : {
          "description" : "Offer matching timeout (ms). Stop trying to match additional tasks for this offer after this time.",
          "type" : "integer",
          "default" : 1000
        },
        "on-elected-prepare-timeout" : {
          "description" : "The timeout for preparing the Marathon instance when elected as leader.",
          "type" : "integer",
          "default" : 180000
        },
        "plugin-conf" : {
          "description" : "The plugin configuration file.",
          "type" : "string"
        },
        "plugin-dir" : {
          "description" : "Path to a local directory containing plugin jars.",
          "type" : "string"
        },
        "reconciliation-initial-delay" : {
          "description" : "This is the length of time, in milliseconds, before Marathon begins to periodically perform task reconciliation operations",
          "type" : "integer",
          "default" : 15000
        },
        "reconciliation-interval" : {
          "description" : "This is the length of time, in milliseconds, between task reconciliation operations.",
          "type" : "integer",
          "default" : 600000
        },
        "reporter-datadog" : {
          "description" : "URL to dogstatsd agent. e.g. udp://localhost:8125?prefix=marathon-test&tags=marathon&interval=10",
          "type" : "string"
        },
        "reporter-graphite" : {
          "description" : "URL to graphite agent. e.g. tcp://localhost:2003?prefix=marathon-test&interval=10",
          "type" : "string"
        },
        "revive-offers-repetitions" : {
          "description" : "Repeat every reviveOffer request this many times, delayed by the --min_revive_offers_interval.",
          "type" : "integer",
          "default" : 3
        },
        "save-tasks-to-launch-timeout" : {
          "description" : "Timeout (ms) after matching an offer for saving all matched tasks that we are about to launch. When reaching the timeout, only the tasks that we could save within the timeout are also launched. All other task launches are temporarily rejected and retried later.",
          "type" : "integer",
          "default" : 3000
        },
        "scale-apps-initial-delay" : {
          "description" : "This is the length of time, in milliseconds, before Marathon begins to periodically attempt to scale apps.",
          "type" : "integer",
          "default" : 15000
        },
        "scale-apps-interval" : {
          "description" : "This is the length of time, in milliseconds, between task scale apps.",
          "type" : "integer",
          "default" : 300000
        },
        "ssl-keystore-password" : {
          "description" : "Password for the keystore supplied with the `ssl_keystore_path` option. Required if `ssl_keystore_path` is supplied. May also be specified with the `MESOSPHERE_KEYSTORE_PASS` environment variable.",
          "type" : "string"
        },
        "ssl-keystore-path" : {
          "description" : "Path to the SSL keystore. HTTPS (SSL) will be enabled if this option is supplied. Requires `--ssl_keystore_password`. May also be specified with the `MESOSPHERE_KEYSTORE_PATH` environment variable.",
          "type" : "string"
        },
        "store-cache" : {
          "description" : "Enabled: (Default) Enable an in-memory cache for the storage layer. Disabled: Disable the in-memory cache for the storage layer. ",
          "type" : "boolean",
          "default" : true
        },
        "task-launch-confirm-timeout" : {
          "description" : "Time, in milliseconds, to wait for a task to enter the TASK_STAGING state before killing it.",
          "type" : "integer",
          "default" : 300000
        },
        "task-launch-timeout" : {
          "description" : "Time, in milliseconds, to wait for a task to enter the TASK_RUNNING state before killing it.",
          "type" : "integer",
          "default" : 300000
        },
        "tracing" : {
          "description" : "Enabled: Enable trace logging of service method calls. Disabled: (Default) Disable trace logging of service method calls.",
          "type" : "boolean",
          "default" : false
        },
        "webui-url" : {
          "description" : "The HTTP(S) url of the web ui, defaulting to the advertised hostname.",
          "type" : "string"
        },
        "zk" : {
          "description" : "ZooKeeper URL for storing state. Format: zk://host1:port1,host2:port2,.../path",
          "type" : "string"
        },
        "zk-compression" : {
          "description" : "Enabled: (Default) Enable compression of zk nodes, if the size of the node is bigger than the configured threshold. Disabled: Disable compression of zk nodes",
          "type" : "boolean",
          "default" : true
        },
        "zk-compression-threshold" : {
          "description" : "(Default: 64 KB) Threshold in bytes, when compression is applied to the ZooKeeper node.",
          "type" : "integer",
          "default" : 65536
        },
        "zk-max-versions" : {
          "description" : "Limit the number of versions, stored for one entity.",
          "type" : "integer",
          "default" : 25
        },
        "zk-session-timeout" : {
          "description" : "The timeout for ZooKeeper sessions in milliseconds",
          "type" : "integer",
          "default" : 10000
        },
        "zk-timeout" : {
          "description" : "The timeout for ZooKeeper in milliseconds.",
          "type" : "integer",
          "default" : 10000
        }
      },
      "required" : [ "master", "framework-name" ],
      "type" : "object"
    }
  },
  "required" : [ "application", "jvm", "marathon" ],
  "type" : "object"
};

// What the object should look like:
module.exports.jsonDocument = {
  "application": {
    "id": "stringValue",
    "cpus": 1,
    "mem": 1248,
    "instances": 1,
    "uris": ["stringValue", "anotherStringValue"]
  },
  "jvm": {
    "heap-min": 256,
    "heap-max": 768
  },
  "marathon": {
    "access-control-allow-origin" : "stringValue",
    "artifact-store" : "stringValue",
    "assets-path" : "stringValue",
    "checkpoint" : true,
    "decline-offer-duration" : 120000,
    "default-accepted-resource-roles" : "stringValue",
    "disable-http" : false,
    "env-vars-prefix" : "stringValue",
    "event-stream-max-outstanding-messages" : 50,
    "event-subscriber" : "stringValue",
    "executor" : "//cmd",
    "failover-timeout" : 604800,
    "framework-name" : "marathon-user",
    "ha" : true,
    "hostname" : "stringValue",
    "http-address" : "stringValue",
    "http-credentials" : "stringValue",
    "http-endpoints" : "stringValue",
    "http-event-callback-slow-consumer-timeout" : 10000,
    "http-max-concurrent-requests" : 10,
    "http-port" : 0,
    "http-realm" : "Mesosphere",
    "https-address" : "stringValue",
    "https-port" : 0,
    "launch-token-refresh-interval" : 30000,
    "launch-tokens" : 100,
    "leader-proxy-connection-timeout" : 5000,
    "leader-proxy-read-timeout" : 10000,
    "local-port-max" : 20000,
    "local-port-min" : 10000,
    "logging-level" : "stringValue",
    "marathon-store-timeout" : 10,
    "master" : "stringValue",
    "max-apps" : 10,
    "max-tasks-per-offer" : 1,
    "mesos-authentication-principal" : "stringValue",
    "mesos-authentication-secret-file" : "stringValue",
    "mesos-leader-ui-url" : "/mesos",
    "mesos-role" : "stringValue",
    "mesos-user" : "stringValue",
    "metrics" : true,
    "min-revive-offers-interval" : 5000,
    "offer-matching-timeout" : 1000,
    "on-elected-prepare-timeout" : 1800000,
    "plugin-conf" : "stringValue",
    "plugin-dir" : "stringValue",
    "reconciliation-initial-delay" : 15000,
    "reconciliation-interval" : 600000,
    "reporter-datadog" : "stringValue",
    "reporter-graphite" : "stringValue",
    "revive-offers-repetitions" : 3,
    "save-tasks-to-launch-timeout" : 3000,
    "scale-apps-initial-delay" : 15000,
    "scale-apps-interval" : 300000,
    "ssl-keystore-password" : "stringValue",
    "ssl-keystore-path" : "stringValue",
    "store-cache" : true,
    "task-launch-confirm-timeout" : 300000,
    "task-launch-timeout" : 300000,
    "tracing" : false,
    "webui-url" : "stringValue",
    "zk" : "stringValue",
    "zk-compression" : true,
    "zk-compression-threshold" : 65536,
    "zk-max-versions" : 25,
    "zk-session-timeout" : 10000,
    "zk-timeout" : 10000
  }
}

module.exports.multipleDefinition = {
  "application":{
    "title":"application",
    "description":"Marathon app configuration properties.",
    "definition":[
      {
        "fieldType":"text",
        "name":"id",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"cpus",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"2"
      },
      {
        "fieldType":"text",
        "name":"mem",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"1536"
      },
      {
        "fieldType":"text",
        "name":"instances",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"1"
      },
      {
        "fieldType":"text",
        "name":"uris",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      }
    ]
  },
  "jvm":{
    "title":"jvm",
    "description":"JVM configuration properties",
    "definition":[
      {
        "fieldType":"text",
        "name":"heap-min",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"256"
      },
      {
        "fieldType":"text",
        "name":"heap-max",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"768"
      }
    ]
  },
  "marathon":{
    "title":"marathon",
    "description":"Marathon command line flags. These are the same flags that are passed through to Marathon when launching manually from the command line. See details here: https://mesosphere.github.io/marathon/docs/command-line-flags.html",
    "definition":[
      {
        "fieldType":"text",
        "name":"access-control-allow-origin",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "title": "nested subtitle",
        "definition": [
          {
            "fieldType":"text",
            "name":"access-control-allow-origin",
            "placeholder":"",
            "required":false,
            "showError":false,
            "showLabel":true,
            "writeType":"input",
            "value":""
          }
        ]
      },
      {
        "fieldType":"text",
        "name":"assets-path",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"checkbox",
        "name":"checkpoint",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":true,
        "checked":true
      },
      {
        "fieldType":"text",
        "name":"decline-offer-duration",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"120000"
      },
      {
        "fieldType":"text",
        "name":"default-accepted-resource-roles",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"checkbox",
        "name":"disable-http",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":false,
        "checked":false
      },
      {
        "fieldType":"text",
        "name":"env-vars-prefix",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"event-stream-max-outstanding-messages",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"50"
      },
      {
        "fieldType":"text",
        "name":"event-subscriber",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"executor",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"//cmd"
      },
      {
        "fieldType":"text",
        "name":"failover-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"604800"
      },
      {
        "fieldType":"text",
        "name":"framework-name",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"marathon-user"
      },
      {
        "fieldType":"checkbox",
        "name":"ha",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":true,
        "checked":true
      },
      {
        "fieldType":"text",
        "name":"hostname",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"http-address",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"http-credentials",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"http-endpoints",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"http-event-callback-slow-consumer-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"10000"
      },
      {
        "fieldType":"text",
        "name":"http-max-concurrent-requests",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"http-port",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"0"
      },
      {
        "fieldType":"text",
        "name":"http-realm",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"Mesosphere"
      },
      {
        "fieldType":"text",
        "name":"https-address",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"https-port",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"0"
      },
      {
        "fieldType":"text",
        "name":"launch-token-refresh-interval",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"30000"
      },
      {
        "fieldType":"text",
        "name":"launch-tokens",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"100"
      },
      {
        "fieldType":"text",
        "name":"leader-proxy-connection-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"5000"
      },
      {
        "fieldType":"text",
        "name":"leader-proxy-read-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"10000"
      },
      {
        "fieldType":"text",
        "name":"local-port-max",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"20000"
      },
      {
        "fieldType":"text",
        "name":"local-port-min",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"10000"
      },
      {
        "fieldType":"text",
        "name":"logging-level",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"marathon-store-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"master",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"zk://master.mesos:2181/mesos"
      },
      {
        "fieldType":"text",
        "name":"max-apps",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"max-tasks-per-offer",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"1"
      },
      {
        "fieldType":"text",
        "name":"mesos-authentication-principal",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"mesos-authentication-secret-file",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"mesos-leader-ui-url",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"/mesos"
      },
      {
        "fieldType":"text",
        "name":"mesos-role",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"mesos-user",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"checkbox",
        "name":"metrics",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":true,
        "checked":true
      },
      {
        "fieldType":"text",
        "name":"min-revive-offers-interval",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"5000"
      },
      {
        "fieldType":"text",
        "name":"offer-matching-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"1000"
      },
      {
        "fieldType":"text",
        "name":"on-elected-prepare-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"180000"
      },
      {
        "fieldType":"text",
        "name":"plugin-conf",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"plugin-dir",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"reconciliation-initial-delay",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"15000"
      },
      {
        "fieldType":"text",
        "name":"reconciliation-interval",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"600000"
      },
      {
        "fieldType":"text",
        "name":"reporter-datadog",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"reporter-graphite",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"revive-offers-repetitions",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"3"
      },
      {
        "fieldType":"text",
        "name":"save-tasks-to-launch-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"3000"
      },
      {
        "fieldType":"text",
        "name":"scale-apps-initial-delay",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"15000"
      },
      {
        "fieldType":"text",
        "name":"scale-apps-interval",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"300000"
      },
      {
        "fieldType":"text",
        "name":"ssl-keystore-password",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"ssl-keystore-path",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"checkbox",
        "name":"store-cache",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":true,
        "checked":true
      },
      {
        "fieldType":"text",
        "name":"task-launch-confirm-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"300000"
      },
      {
        "fieldType":"text",
        "name":"task-launch-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"300000"
      },
      {
        "fieldType":"checkbox",
        "name":"tracing",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":false,
        "checked":false
      },
      {
        "fieldType":"text",
        "name":"webui-url",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"text",
        "name":"zk",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":""
      },
      {
        "fieldType":"checkbox",
        "name":"zk-compression",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":true,
        "checked":true
      },
      {
        "fieldType":"text",
        "name":"zk-compression-threshold",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"65536"
      },
      {
        "fieldType":"text",
        "name":"zk-max-versions",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"25"
      },
      {
        "fieldType":"text",
        "name":"zk-session-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"10000"
      },
      {
        "fieldType":"text",
        "name":"zk-timeout",
        "placeholder":"",
        "required":false,
        "showError":false,
        "showLabel":true,
        "writeType":"input",
        "value":"10000"
      }
    ]
  }
};

module.exports.schema2 = {
  "type":"object",
  "properties":{
    "mesos":{
      "description":"Mesos specific configuration properties",
      "type":"object",
      "properties":{
        "master":{
          "default":"zk://master.mesos:2181/mesos",
          "description":"The URL of the Mesos master. The format is a comma-delimited list of hosts like zk://host1:port,host2:port/mesos. If using ZooKeeper, pay particular attention to the leading zk:// and trailing /mesos! If not using ZooKeeper, standard host:port patterns, like localhost:5050 or 10.0.0.5:5050,10.0.0.6:5050, are also acceptable.",
          "type":"string"
        }
      },
      "required":[
        "master"
      ]
    },
    "cassandra":{
      "description":"Cassandra Framework Configuration Properties",
      "type":"object",
      "additionalProperties":false,
      "properties":{
        "framework":{
          "description":"Framework Scheduler specific Configuration Properties",
          "type":"object",
          "additionalProperties":false,
          "properties":{
            "failover-timeout-seconds":{
              "description":"The failover_timeout for Mesos in seconds. If the framework instance has not re-registered with Mesos this long after a failover, Mesos will shut down all running tasks started by the framework.",
              "type":"integer",
              "minimum":0,
              "default":604800
            },
            "cpus":{
              "default":0.5,
              "description":"CPU shares to allocate to each Cassandra framework instance.",
              "type":"number"
            },
            "mem":{
              "default":512.0,
              "description":"Memory (MB) to allocate to each Cassandra framework instance.",
              "minimum":512.0,
              "type":"number"
            },
            "instances":{
              "default":1,
              "description":"Number of Cassandra framework instances to run.",
              "minimum":0,
              "type":"integer"
            },
            "role":{
              "description":"Mesos role for this framework.",
              "type":"string",
              "default":"*"
            },
            "authentication":{
              "description":"Framework Scheduler Authentication Configuration Properties",
              "type":"object",
              "additionalProperties":false,
              "properties":{
                "enabled":{
                  "description":"Whether framework authentication should be used",
                  "type":"boolean",
                  "default":false
                },
                "principal":{
                  "description":"The Mesos principal used for authentication.",
                  "type":"string"
                },
                "secret":{
                  "description":"The path to the Mesos secret file containing the authentication secret.",
                  "type":"string"
                }
              },
              "required":[
                "enabled"
              ]
            }
          },
          "required":[
            "instances",
            "cpus",
            "mem",
            "failover-timeout-seconds",
            "role",
            "authentication"
          ]
        },
        "cluster-name":{
          "description":"The name of the framework to register with mesos. Will also be used as the cluster name in Cassandra",
          "type":"string",
          "default":"dcos"
        },
        "zk":{
          "description":"ZooKeeper URL for storing state. Format: zk://host1:port1,host2:port2,.../path (can have nested directories)",
          "type":"string"
        },
        "zk-timeout-ms":{
          "description":"Timeout for ZooKeeper in milliseconds.",
          "type":"integer",
          "minimum":0,
          "default":10000
        },
        "node-count":{
          "description":"The number of nodes in the ring for the framework to run.",
          "type":"integer",
          "minimum":1,
          "default":3
        },
        "seed-count":{
          "description":"The number of seed nodes in the ring for the framework to run.",
          "type":"integer",
          "minimum":1,
          "default":2
        },
        "health-check-interval-seconds":{
          "description":"The interval in seconds that the framework should check the health of each Cassandra Server instance.",
          "type":"integer",
          "minimum":15,
          "default":60
        },
        "bootstrap-grace-time-seconds":{
          "description":"The minimum number of seconds to wait between starting each node. Setting this too low could result in the ring not bootstrapping correctly.",
          "type":"integer",
          "minimum":15,
          "default":120
        },
        "data-directory":{
          "description":"The location on disk where Cassandra will be configured to write it's data.",
          "type":"string",
          "default":"."
        },
        "resources":{
          "description":"Cassandra Server Resources Configuration Properties",
          "type":"object",
          "additionalProperties":false,
          "properties":{
            "cpus":{
              "description":"CPU shares to allocate to each Cassandra Server Instance.",
              "type":"number",
              "minimum":0.0,
              "default":0.1
            },
            "mem":{
              "description":"Memory (MB) to allocate to each Cassandra Server instance.",
              "type":"integer",
              "minimum":0,
              "default":768
            },
            "disk":{
              "description":"Disk (MB) to allocate to each Cassandra Server instance.",
              "type":"integer",
              "minimum":0,
              "default":16
            },
            "heap-mb":{
              "description":"The amount of memory in MB that are allocated to each Cassandra Server Instance. This value should be smaller than 'cassandra.resources.mem'. The remaining difference will be used for memory mapped files and other off-heap memory requirements.",
              "type":"integer",
              "minimum":0
            }
          },
          "required":[
            "cpus",
            "mem",
            "disk"
          ]
        },
        "dc":{
          "description":"Cassandra multi Datacenter Configuration Properties",
          "type":"object",
          "additionalProperties":false,
          "properties":{
            "default-dc":{
              "description":"Default value to be set for dc name in the GossipingPropertyFileSnitch",
              "type":"string",
              "default":"DC1"
            },
            "default-rack":{
              "description":"Default value to be set for rack name in the GossipingPropertyFileSnitch",
              "type":"string",
              "default":"RAC1"
            },
            "external-dcs":{
              "description":"Name and URL for another instance of Cassandra DC/OS Service",
              "type":"array",
              "additionalProperties":false,
              "items":{
                "type":"object",
                "additionalProperties":false,
                "properties":{
                  "name":{
                    "type":"string"
                  },
                  "url":{
                    "type":"string"
                  }
                },
                "required":[
                  "name",
                  "url"
                ]
              }
            }
          },
          "required":[
            "default-dc",
            "default-rack"
          ]
        }
      },
      "required":[
        "framework",
        "cluster-name",
        "zk-timeout-ms",
        "node-count",
        "seed-count",
        "health-check-interval-seconds",
        "bootstrap-grace-time-seconds",
        "data-directory",
        "resources"
      ]
    }
  },
  "required":[
    "mesos",
    "cassandra"
  ]
}

module.exports.schema3 = {
  "type":"object",
  "properties":{
    "mesos":{
      "description":"Mesos specific configuration properties",
      "type":"object",
      "properties":{
        "master":{
          "default":"zk://master.mesos:2181/mesos",
          "description":"The URL of the Mesos master. The format is a comma-delimited list of hosts like zk://host1:port,host2:port/mesos. If using ZooKeeper, pay particular attention to the leading zk:// and trailing /mesos! If not using ZooKeeper, standard host:port patterns, like localhost:5050 or 10.0.0.5:5050,10.0.0.6:5050, are also acceptable.",
          "type":"string"
        }
      },
      "required":[
        "master"
      ]
    },
    "kafka":{
      "description":"Kafka framework configuration properties",
      "type":"object",
      "additionalProperties":false,
      "properties":{
        "app":{
          "description":"Marathon app configuration properties",
          "type":"object",
          "additionalProperties":false,
          "properties":{
            "cpus":{
              "description":"cpu requirements",
              "type":"number",
              "default":0.5
            },
            "mem":{
              "description":"mem requirements (this should be approximately 120% of the heap size).",
              "type":"integer",
              "default":307
            },
            "heap-mb":{
              "description":"Heap size for scheduler JVM, in MiB",
              "type":"integer",
              "default":256
            },
            "instances":{
              "description":"app instances",
              "type":"integer",
              "default":1
            }
          },
          "required":[
            "cpus",
            "mem",
            "instances",
            "heap-mb"
          ]
        },
        "zk":{
          "type":"string",
          "description":"ZK URL for Kafka",
          "default":"master.mesos:2181"
        },
        "api":{
          "type":"string",
          "description":"Scheduler API URL to bind to",
          "default":"http://$HOST:$PORT0"
        },
        "storage":{
          "type":"string",
          "description":"State storage path. See --storage option",
          "default":"zk:/kafka-mesos"
        },
        "jre":{
          "type":"string",
          "description":"See --jre option",
          "default":"jre-7u79-openjdk.tgz"
        },
        "framework-name":{
          "type":"string",
          "description":"Mesos Framework Name",
          "default":"kafka"
        },
        "framework-role":{
          "type":"string",
          "description":"Mesos Framework Role",
          "default":"*"
        },
        "user":{
          "type":"string",
          "description":"Mesos user to run tasks",
          "default":""
        },
        "principal":{
          "type":"string",
          "description":"Mesos principal (username)",
          "default":""
        },
        "secret":{
          "type":"string",
          "description":"Mesos secret (password)",
          "default":""
        },
        "other-options":{
          "type":"string",
          "description":"Other Scheduler options if required",
          "default":""
        }
      },
      "required":[
        "app",
        "zk",
        "api",
        "storage",
        "jre",
        "framework-name",
        "framework-role",
        "user",
        "principal",
        "secret",
        "other-options"
      ]
    }
  }
}
