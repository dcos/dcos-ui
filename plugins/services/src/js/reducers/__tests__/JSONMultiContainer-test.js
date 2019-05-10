const Batch = require("#SRC/js/structs/Batch");
const { combineParsers } = require("#SRC/js/utils/ParserUtil");
const { combineReducers } = require("#SRC/js/utils/ReducerUtil");
const JSONMultiContainerParser = require("../JSONMultiContainerParser");
const JSONMultiContainerReducers = require("../JSONMultiContainerReducers");

describe("JSONMultiContainer", function() {
  describe("integrity", function() {
    it("parses and reduce without changing the JSON", function() {
      const podDefinition = {
        id: "/podABCD",
        labels: {
          POD_LABEL: "foo"
        },
        volumes: [
          {
            name: "volume_1",
            host: "/mnt/volume_1"
          }
        ],
        environment: {
          FOO: "bar"
        },
        networks: [
          {
            mode: "container",
            name: "dcos"
          },
          {
            mode: "container",
            name: "dcos2"
          }
        ],
        containers: [
          {
            name: "container-1",
            image: { kind: "DOCKER", id: "jdef/my-web-service-abc:v1.1.1" },
            endpoints: [
              {
                name: "nginx",
                hostPort: 0,
                protocol: ["tcp"],
                labels: {
                  vipDCOS: "1.2.3.4:80" // Custom VIP
                }
              },
              {
                name: "nginx",
                hostPort: 0,
                protocol: ["tcp"],
                labels: {
                  VIP_0: "1.2.3.4:80" // Custom VIP
                }
              }
            ],
            resources: { cpus: 0.5, mem: 64, disk: "" },
            volumeMounts: []
          },
          {
            name: "container-2",
            image: { kind: "DOCKER", id: "jdef/my-web-service-abc:v1.1.1" },
            endpoints: [
              {
                name: "nginx",
                networkNames: ["dcos"],
                hostPort: 0,
                protocol: ["udp", "tcp"],
                labels: {
                  VIP_0: "/podABCD:81" // App ID based VIP
                }
              }
            ],
            resources: { cpus: 0.5, mem: 64, disk: "" },
            volumeMounts: []
          }
        ],
        fetch: [],
        scaling: {
          kind: "fixed",
          instances: 10
        },
        scheduling: {
          placement: {
            acceptedResourceRoles: ["*"],
            constraints: [{ fieldName: "hostname", operator: "UNIQUE" }]
          },
          backoff: {
            backoff: 1,
            backoffFactor: 1.15,
            maxLaunchDelay: 30
          },
          upgrade: {
            minimumHealthCapacity: 1,
            maximumOverCapacity: 1
          },
          killSelection: "YOUNGEST_FIRST",
          unreachableStrategy: {
            inactiveAfterSeconds: 0,
            expungeAfterSeconds: 0
          }
        }
      };

      const reducers = combineReducers(JSONMultiContainerReducers).bind({});
      const parser = combineParsers(JSONMultiContainerParser);
      const batch = parser(JSON.parse(JSON.stringify(podDefinition))).reduce(
        function(batch, item) {
          return batch.add(item);
        },
        new Batch()
      );
      const jsonFromBatch = batch.reduce(reducers, {});
      expect(jsonFromBatch).toEqual(podDefinition);
      const batchFromJSONFromBatch = parser(jsonFromBatch).reduce(function(
        batch,
        item
      ) {
        return batch.add(item);
      },
      new Batch());
      const jsonFromBatchFromJSONFromBatch = batchFromJSONFromBatch.reduce(
        reducers,
        {}
      );
      expect(jsonFromBatchFromJSONFromBatch).toEqual(podDefinition);
    });
  });
});
