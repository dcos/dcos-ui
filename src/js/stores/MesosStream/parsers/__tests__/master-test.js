import getMaster from "../master";

function masterMessage() {
  return {
    type: "GET_MASTER",
    get_master: {
      master_info: {
        id: "f4b0e45f-9112-4254-bcad-225353006080",
        ip: 537337772,
        port: 5050,
        pid: "master@172.31.7.32:5050",
        hostname: "172.31.7.32",
        version: "1.5.1",
        address: { hostname: "172.31.7.32", ip: "172.31.7.32", port: 5050 },
        domain: {
          fault_domain: {
            region: { name: "us-east-1" },
            zone: { name: "us-east-1a" }
          }
        },
        capabilities: [{ type: "AGENT_UPDATE" }]
      },
      start_time: 1532339115.87122,
      elected_time: 1532340694.04573
    }
  };
}

describe("#getMaster", function() {
  it("flattens elected_time", function() {
    const newState = getMaster({}, masterMessage());

    expect(newState.master_info.elected_time).toBe(1532340694.04573);
  });

  it("flattens start_time", function() {
    const newState = getMaster({}, masterMessage());

    expect(newState.master_info.start_time).toBe(1532339115.87122);
  });

  it("flattens copies the full master info", function() {
    const newState = getMaster({}, masterMessage());

    expect(newState.master_info).toEqual({
      id: "f4b0e45f-9112-4254-bcad-225353006080",
      ip: 537337772,
      port: 5050,
      pid: "master@172.31.7.32:5050",
      hostname: "172.31.7.32",
      version: "1.5.1",
      address: { hostname: "172.31.7.32", ip: "172.31.7.32", port: 5050 },
      domain: {
        fault_domain: {
          region: { name: "us-east-1" },
          zone: { name: "us-east-1a" }
        }
      },
      capabilities: [{ type: "AGENT_UPDATE" }],
      start_time: 1532339115.87122,
      elected_time: 1532340694.04573
    });
  });

  it("ignores non master message", function() {
    const message = masterMessage();
    message.type = "GET_NODES";
    const newState = getMaster({}, message);

    expect(newState).toEqual({});
  });

  it("preserves state", function() {
    const message = masterMessage();
    const newState = getMaster({ something: "something" }, message);

    expect(newState.something).toEqual("something");
  });

  it("copies state", function() {
    const message = masterMessage();
    const state = { something: "something" };
    const newState = getMaster(state, message);

    state.something = "something_else";

    expect(newState.something).toEqual("something");
  });

  it("copies message", function() {
    const message = masterMessage();
    const newState = getMaster({}, message);

    message.start_time = 0;

    expect(newState.master_info.start_time).toEqual(1532339115.87122);
  });
});
