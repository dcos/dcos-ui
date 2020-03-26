import {
  getAgentsAction,
  agentAddedAction,
  agentRemovedAction,
} from "../agents";

describe("agents parser", () => {
  describe("#getAgentsAction", () => {
    it("parses the correct message", () => {
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
                  value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
                },
              },
              pid: "slave(3)@127.0.1.1:34626",
              version: "1.1.0",
            },
          ],
        },
      };

      const result = getAgentsAction(state, message);

      expect(result).toEqual({
        slaves: [
          {
            active: true,
            hostname: "myhost",
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0",
          },
        ],
      });
    });
  });

  describe("#agentAddedAction", () => {
    it("parses the correct message", () => {
      const state = { slaves: [] };
      const message = {
        type: "AGENT_ADDED",
        agent_added: {
          agent: {
            active: true,
            agent_info: {
              hostname: "myhost",
              id: {
                value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
              },
            },
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0",
          },
        },
      };

      const result = agentAddedAction(state, message);

      expect(result).toEqual({
        slaves: [
          {
            active: true,
            hostname: "myhost",
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0",
          },
        ],
      });
    });
  });

  describe("#agentRemovedAction", () => {
    it("parses the correct message", () => {
      const state = {
        slaves: [
          {
            active: true,
            hostname: "myhost",
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            pid: "slave(3)@127.0.1.1:34626",
            version: "1.1.0",
          },
        ],
      };
      const message = {
        type: "AGENT_REMOVED",
        agent_removed: {
          agent_id: {
            value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
          },
        },
      };

      const result = agentRemovedAction(state, message);

      expect(result).toEqual({ slaves: [] });
    });
  });
});
