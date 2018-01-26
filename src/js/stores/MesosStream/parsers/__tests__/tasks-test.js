import { getTasksAction, taskAddedAction, taskUpdatedAction } from "../tasks";

describe("tasks parser", function() {
  describe("#getTasksAction", function() {
    it("parses the correct message", function() {
      const state = {};
      const message = require("./fixtures/getTasksMessage.json");

      const result = getTasksAction(state, message);

      expect(result).toEqual({
        tasks: [
          {
            id: "2",
            task_id: {
              value: "2"
            },
            slave_id: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-S0",
            agent_id: {
              value: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-S0"
            },
            executor_id: "default",
            framework_id: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-0000",
            resources: {},
            labels: undefined,
            isStartedByMarathon: false
          },
          {
            slave_id: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-S0",
            agent_id: {
              value: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-S0"
            },
            executor_id: "default",
            framework_id: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-0000",
            name: "test",
            resources: {
              cpus: 2.0,
              mem: 1024.0,
              disk: 1024.0,
              ports: [
                {
                  begin: 31000,
                  end: 32000
                }
              ]
            },
            state: "TASK_RUNNING",
            status_update_state: "TASK_RUNNING",
            status_update_uuid: "ycLTRBo8TjKFTrh4vsBERg==",
            statuses: [
              {
                agent_id: {
                  value: "d4bd102f-e25f-46dc-bb5d-8b10bca133d8-S0"
                },
                container_status: {
                  network_infos: [
                    {
                      ip_addresses: [
                        {
                          ip_address: "127.0.1.1"
                        }
                      ]
                    }
                  ]
                },
                executor_id: {
                  value: "default"
                },
                source: "SOURCE_EXECUTOR",
                state: "TASK_RUNNING",
                task_id: {
                  value: "1"
                },
                timestamp: 1470820172.32565,
                uuid: "ycLTRBo8TjKFTrh4vsBERg=="
              }
            ],
            labels: [
              {
                key: "LABEL_1",
                value: "VALUE_1"
              },
              {
                key: "DCOS_COMMONS_API_VERSION",
                value: "1"
              }
            ],
            id: "1",
            task_id: {
              value: "1"
            },
            isStartedByMarathon: false,
            sdkTask: true
          }
        ]
      });
    });
  });

  describe("#taskAddedAction", function() {
    it("parses the correct message", function() {
      const state = { tasks: [] };
      const message = {
        type: "TASK_ADDED",
        task_added: {
          task: {
            task_id: {
              value: "1"
            },
            agent_id: {
              value: "1"
            },
            framework_id: {
              value: "1"
            },
            resources: []
          }
        }
      };

      const result = taskAddedAction(state, message);

      expect(result).toEqual({
        tasks: [
          {
            slave_id: "1",
            agent_id: {
              value: "1"
            },
            framework_id: "1",
            task_id: {
              value: "1"
            },
            id: "1",
            resources: {},
            labels: undefined,
            isStartedByMarathon: false
          }
        ]
      });
    });
  });

  describe("#taskUpdatedAction", function() {
    it("parses the correct message", function() {
      const state = {
        tasks: [
          {
            state: "TASK_PENDING",
            statuses: [],
            slave_id: undefined,
            executor_id: undefined,
            framework_id: "f1",
            task_id: {
              value: "1"
            },
            id: "1",
            resources: {},
            labels: undefined
          }
        ]
      };
      const message = {
        type: "TASK_UPDATED",
        task_updated: {
          state: "TASK_RUNNING",
          framework_id: {
            value: "f1"
          },
          status: {
            task_id: {
              value: "1"
            }
          }
        }
      };

      const result = taskUpdatedAction(state, message);

      expect(result).toEqual({
        tasks: [
          {
            state: "TASK_RUNNING",
            statuses: [{ task_id: { value: "1" } }],
            slave_id: undefined,
            executor_id: undefined,
            framework_id: "f1",
            task_id: {
              value: "1"
            },
            id: "1",
            resources: {},
            labels: undefined
          }
        ]
      });
    });
  });
});
