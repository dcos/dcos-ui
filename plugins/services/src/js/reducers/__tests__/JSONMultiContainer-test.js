const Batch = require("#SRC/js/structs/Batch");
const { combineParsers } = require("#SRC/js/utils/ParserUtil");
const { combineReducers } = require("#SRC/js/utils/ReducerUtil");
const JSONMultiContainerParser = require("../JSONMultiContainerParser");
const JSONMultiContainerReducers = require("../JSONMultiContainerReducers");

describe("JSONMultiContainer", function() {
  describe("integrity", function() {
    it("parse and reduce doesn't change JSON", function() {
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
            mode: "host"
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
                protocol: [],
                labels: {
                  VIP_0: "1.2.3.4:80"
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
                hostPort: 0,
                protocol: [],
                labels: {
                  VIP_0: "1.2.3.4:80"
                }
              }
            ],
            resources: { cpus: 0.5, mem: 64, disk: "" },
            volumeMounts: []
          }
        ],
        fetch: [],
        ipAddress: null,
        scaling: {
          kind: "fixed",
          instances: 10
        },
        scheduling: {
          placement: {
            constraints: [{ fieldName: "hostname", operator: "UNIQUE" }]
          }
        }
      };

      const reducers = combineReducers(JSONMultiContainerReducers).bind({});
      const parser = combineParsers(JSONMultiContainerParser);
      const batch = parser(podDefinition).reduce(function(batch, item) {
        return batch.add(item);
      }, new Batch());
      expect(batch.reduce(reducers, {})).toEqual(podDefinition);
    });
  });
});
