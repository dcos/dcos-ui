import subscribedAction from "../subscribed";

describe("subscribed message parser", () => {
  it("parses the correct message", () => {
    const state = {};
    const message = {
      type: "SUBSCRIBED",
      subscribed: {
        get_state: {
          get_frameworks: { frameworks: [] },
          get_tasks: { tasks: [] },
          get_executors: { executors: [] },
          get_agents: { agents: [] },
        },
      },
    };

    const result = subscribedAction(state, message);

    expect(result).toEqual({
      frameworks: [],
      tasks: [],
      executors: [],
      slaves: [],
    });
  });
});
