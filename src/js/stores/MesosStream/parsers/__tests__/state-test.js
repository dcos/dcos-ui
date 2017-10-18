import getStateAction from "../state";

describe("state message parser", function() {
  it("parses the correct message", function() {
    const state = {};
    const message = {
      type: "GET_STATE",
      get_state: {
        get_frameworks: { frameworks: [] },
        get_tasks: { tasks: [] },
        get_executors: { executors: [] },
        get_agents: { agents: [] }
      }
    };

    const result = getStateAction(state, message);

    expect(result).toEqual({
      frameworks: [],
      tasks: [],
      executors: [],
      slaves: []
    });
  });
});
