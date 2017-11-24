import {
  getAgentsAction,
  agentAddedAction,
  agentRemovedAction
} from "../agents";

describe("agents parser", function() {
  describe("#getAgentsAction", function() {
    it("parses the correct message", function() {
      const state = {};
      const message = {
        type: "GET_AGENTS",
        get_agents: {
          agents: [
            {
              active: true,
              agent_info: {
                hostname: "myhost",
                id: {
                  value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0"
                }
              },
              pid: "slave(3)@127.0.1.1:34626",
              version: "1.1.0"
            }
          ]
        }
      };

      const result = getAgentsAction(state, message);

      expect(result).toEqual({
        slaves: [
          {
            active: true,
            hostname: "myhost",
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0"
          }
        ]
      });
    });
  });

  describe("#agentAddedAction", function() {
    it("parses the correct message", function() {
      const state = { slaves: [] };
      const message = {
        type: "AGENT_ADDED",
        agent_added: {
          agent: {
            active: true,
            agent_info: {
              hostname: "myhost",
              id: {
                value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0"
              }
            },
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0"
          }
        }
      };

      const result = agentAddedAction(state, message);

      expect(result).toEqual({
        slaves: [
          {
            active: true,
            hostname: "myhost",
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0"
          }
        ]
      });
    });
  });

  describe("#agentRemovedAction", function() {
    it("parses the correct message", function() {
      const state = {
        slaves: [
          {
            active: true,
            hostname: "myhost",
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0"
          }
        ]
      };
      const message = {
        type: "AGENT_REMOVED",
        agent_removed: {
          agent: {
            active: true,
            agent_info: {
              hostname: "myhost",
              id: {
                value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0"
              }
            },
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0"
          }
        }
      };

      const result = agentRemovedAction(state, message);

      expect(result).toEqual({ slaves: [] });
    });
  });
});
